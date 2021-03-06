/**
 * @fileoverview This files defines an Angular Service for managing the
 * selected layers permalinks
 */

goog.provide('app.LayerPermalinkManager');

goog.require('app');
goog.require('app.GetLayerForCatalogNode');
goog.require('app.WmsHelper');
goog.require('app.StateManager');
goog.require('app.Themes');
goog.require('goog.array');
goog.require('goog.string');
goog.require('ngeo.BackgroundLayerMgr');
goog.require('ol.events');


/**
 * @constructor
 * @param {app.StateManager} appStateManager The state service.
 * @param {app.GetLayerForCatalogNode} appGetLayerForCatalogNode The layer
 * service.
 * @param {app.Themes} appThemes The themes service.
 * @param {app.Theme} appTheme The theme service.
 * @param {ngeo.BackgroundLayerMgr} ngeoBackgroundLayerMgr the background layer
 * manager.
 * @param {ngeo.Location} ngeoLocation ngeo location service.
 * @param {app.WmsHelper} appWmsHelper The wms herlper service.
 * @ngInject
 */
app.LayerPermalinkManager = function(appStateManager,
    appGetLayerForCatalogNode, appThemes, appTheme, ngeoBackgroundLayerMgr,
    ngeoLocation, appWmsHelper) {

  /**
   * @type {app.WmsHelper}
   * @private
   */
  this.appWmsHelper_ = appWmsHelper;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {Array.<number|string>}
   * @private
   */
  this.unavailableLayers_ = [];

  /**
   * @type {Array.<number>}
   * @private
   */
  this.unavailableOpacities_ = [];

  /**
   * @type {app.Themes}
   * @private
   */
  this.appThemes_ = appThemes;

  /**
   * @type {app.Theme}
   * @private
   */
  this.appTheme_ = appTheme;

  /**
   * @type {app.StateManager}
   * @private
   */
  this.stateManager_ = appStateManager;

  /**
   * @type {ngeo.BackgroundLayerMgr}
   * @private
   */
  this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;

  /**
   * @type {app.GetLayerForCatalogNode}
   * @private
   */
  this.getLayerFunc_ = appGetLayerForCatalogNode;

  /**
   * @type {function()|undefined}
   * @private
   */
  this.scopeWatcher_ = undefined;
};


/**
 * @const
 * @private
 */
app.LayerPermalinkManager.V2_BGLAYER_TO_V3_ = {
  'webbasemap': 'basemap_2015_global',
  'pixelmaps-color': 'topogg',
  'pixelmaps-gray': 'topo_bw_jpeg',
  'streets': 'streets_jpeg',
  'voidlayer': 'blank'
};


/**
 * @param {Array.<ol.layer.Layer>} layers The layers.
 * @private
 */
app.LayerPermalinkManager.prototype.setLayerState_ = function(layers) {
  var layerIds = goog.array.map(layers, function(layer) {
    return layer.get('queryable_id');
  });
  var opacities = goog.array.map(layers, function(layer) {
    return layer.getOpacity();
  });
  var bgLayer = this.backgroundLayerMgr_.get(this.map_);
  var bgLabel = 'blank';
  if (bgLayer) {
    bgLabel = bgLayer.get('label');
  }
  this.stateManager_.updateState({
    'layers': layerIds.join('-'),
    'opacities': opacities.join('-'),
    'bgLayer': bgLabel
  });
};


/**
 * @param {Array.<number|string>} layerIds The ids.
 * @param {Array.<number>} opacities The opacities.
 * @param {Array.<Object>} flatCatalogue The catalog.
 * @private
 */
app.LayerPermalinkManager.prototype.applyLayerStateToMap_ = function(
    layerIds, opacities, flatCatalogue) {
  layerIds.reverse();
  opacities.reverse();
  var addedLayers = this.map_.getLayers().getArray();
  goog.array.extend(layerIds, this.unavailableLayers_);
  goog.array.extend(opacities, this.unavailableOpacities_);

  this.unavailableLayers_ = [];
  this.unavailableOpacities_ = [];
  goog.array.forEach(layerIds,
  function(layerId, layerIndex) {
    if (goog.isNumber(layerId) && !isNaN(layerId)) {
      var node = goog.array.find(flatCatalogue, function(catItem) {
        return catItem.id === layerId;
      });
      if (goog.isDefAndNotNull(node)) {
        var layer = this.getLayerFunc_(node);
        if (goog.isDef(opacities)) {
          // set opacity trough metadata to not interfere
          // with the layer opacity manager service
          layer.get('metadata')['start_opacity'] =
              opacities[layerIndex];
        }
        // Skip layers that have already been added
        if (goog.array.every(addedLayers, function(addedLayer) {
          return addedLayer.get('queryable_id') !==
              layer.get('queryable_id');
        }, this)) {
          this.map_.addLayer(layer);
        }
      } else {
        this.setLayerAsUnavailable_(addedLayers, layerId,
            opacities[layerIndex]);
        return;
      }
    } else {
      if (/** @type {string} */ (layerId).indexOf('WMS||') === 0) {
        this.appWmsHelper_.getLayerById(/** @type {string} */ (layerId)).
            then(function(rawLayer) {
              var wmsLayer = this.appWmsHelper_.createWmsLayers(
                  this.map_, rawLayer);
              wmsLayer.get('metadata')['start_opacity'] =
                opacities[layerIndex];
              if (goog.array.every(addedLayers, function(addedLayer) {
                return addedLayer.get('queryable_id') !==
                    wmsLayer.get('queryable_id');
              }, this)) {
                this.map_.addLayer(wmsLayer);
              }
            }.bind(this));
      } else {
        this.setLayerAsUnavailable_(addedLayers,
            /** @type {string} */ (layerId), opacities[layerIndex]);
        return;
      }
    }
  }, this);
};

/**
 * @param {Array<ol.layer.Layer>} addedLayers The mapLayers.
 * @param {string|number} layerId The id of the layer to remove.
 * @param {number} opacity The opacity of the layer to remove.
 * @private
 */
app.LayerPermalinkManager.prototype.setLayerAsUnavailable_ = function(
    addedLayers, layerId, opacity) {
  var unavailableLayer =
      goog.array.find(addedLayers, function(addedLayer) {
        if (addedLayer.get('queryable_id') === layerId) {
          return true;
        }
        return false;
      }, this);
  this.map_.removeLayer(unavailableLayer);
  this.unavailableLayers_.push(layerId);
  this.unavailableOpacities_.push(opacity);
};


/**
 * @param {string} parameter The parameter.
 * @private
 * @return {Array.<number>|undefined} The values.
 */
app.LayerPermalinkManager.prototype.getStateValue_ = function(parameter) {
  var result = '';
  var response = this.stateManager_.getInitialValue(parameter);
  if (goog.isDef(response) && response.length > 0) {
    result = response;
  } else {
    return undefined;
  }
  if (parameter === 'layers') {
    return this.splitLayers_(result, '-');
  }
  return this.splitNumbers_(result, '-');
};


/**
 * @param {string} parameter The parameter to get.
 * @param {string} splitChar The char to split with.
 * @private
 * @return {Array.<number>|undefined} The values.
 */
app.LayerPermalinkManager.prototype.splitNumbers_ =
    function(parameter, splitChar) {
      var items = [];
      if (goog.isDef(parameter)) {
        goog.array.forEach(parameter.split(splitChar), function(string) {
          var value = parseFloat(string);
          if (goog.isNumber(value) && !isNaN(value)) {
            items.push(value);
          }
        });
      }
      return items.length === 0 ? undefined : items;
    };


/**
 * @param {string} parameter The parameter to get.
 * @param {string} splitChar The char to split with.
 * @private
 * @return {Array.<number|string>|undefined} The values.
 */
app.LayerPermalinkManager.prototype.splitLayers_ =
    function(parameter, splitChar) {
      var items = [];
      if (goog.isDef(parameter)) {
        goog.array.forEach(parameter.split(splitChar), function(string) {
          var value = parseFloat(string);
          if (goog.isNumber(value) && !isNaN(value)) {
            items.push(value);
          } else {
            if (string.indexOf('WMS||') === 0) {
              items.push(string);
            }
          }
        });
      }
      return items.length === 0 ? undefined : items;
    };


/**
 * @param {Array.<ol.layer.Layer>} selectedLayers The selected layers.
 * @private
 */
app.LayerPermalinkManager.prototype.setupWatchers_ = function(selectedLayers) {

  ol.events.listen(this.backgroundLayerMgr_, ngeo.BackgroundEventType.CHANGE,
      function() {
        var bgLayer = this.backgroundLayerMgr_.get(this.map_);
        this.stateManager_.updateState({
          'bgLayer': bgLayer.get('label')
        });
      }, this);

  if (goog.isFunction(this.scopeWatcher_)) {
    this.scopeWatcher_(); // destroy previous watcher
  }
  this.scopeWatcher_ = this.scope_.$watchCollection(goog.bind(function() {
    return selectedLayers;
  }, this), goog.bind(function() {
    this.setLayerState_(selectedLayers);
  }, this));

  var layers = this.map_.getLayers();
  // Add event listeners to existing selected layers
  goog.array.forEach(layers.getArray(), function(layer) {
    ol.events.listen(layer, ol.ObjectEventType.PROPERTYCHANGE,
        function() {
          this.setLayerState_(selectedLayers);
        }, this);
  }, this);
  // Add event listener to all future selected layers
  ol.events.listen(layers, ol.CollectionEventType.ADD,
      /**
       * @param {ol.CollectionEventType} collEvt Collection event.
       */
      function(collEvt) {
        var layer = /** @type {ol.layer.Layer} */ (collEvt.element);
        ol.events.listen(layer, ol.ObjectEventType.PROPERTYCHANGE,
            /**
             * @param {ol.ObjectEventType} layerEvt Layer event
             */
            function(layerEvt) {
              this.setLayerState_(selectedLayers);
            }, this);
      }, this);
};


/**
 * @param {Array} element The element.
 * @return {Array} array The children.
 * @private
 */
app.LayerPermalinkManager.getAllChildren_ = function(element) {
  var array = [];
  for (var i = 0; i < element.length; i++) {
    if (element[i].hasOwnProperty('children')) {
      goog.array.extend(array, app.LayerPermalinkManager.getAllChildren_(
          element[i].children)
      );
    } else {
      element[i].id = element[i].id;
      array.push(element[i]);
    }
  }
  return array;
};


/**
 * @param {angular.Scope} scope The scope.
 * @param {ol.Map} map The map.
 * @param {Array.<ol.layer.Layer>} selectedLayers The selected layers.
 */
app.LayerPermalinkManager.prototype.init =
    function(scope, map, selectedLayers) {
  /**
   * @type {angular.Scope}
   */
      this.scope_ = scope;

  /**
   * @type {ol.Map}
   * @private
   */
      this.map_ = map;

  /**
   * @type {number}
   * @private
   */
      this.initialVersion_ = this.stateManager_.getVersion();

  /**
   * @type {boolean}
   * @private
   */
      this.initialized_ = false;

  // Wait for themes to load before adding layers from state
      ol.events.listen(this.appThemes_, app.ThemesEventType.LOAD,
      /**
       * @param {ol.events.Event} evt Event.
       */
      function(evt) {
        this.appThemes_.getBgLayers().then(goog.bind(
            /**
             * @param {Array.<ol.layer.Base>} bgLayers The background layer.
             */
            function(bgLayers) {
              var stateBgLayerLabel, stateBgLayerOpacity;
              var mapId = this.ngeoLocation_.getParam('map_id');
              if (!this.initialized_) {
                stateBgLayerLabel =
                    this.stateManager_.getInitialValue('bgLayer');
                stateBgLayerOpacity =
                    this.stateManager_.getInitialValue('bgOpacity');
                if (goog.isDefAndNotNull(stateBgLayerLabel) ||
                    (goog.isDefAndNotNull(stateBgLayerOpacity) &&
                    parseInt(stateBgLayerOpacity, 0) === 0)) {
                  if (this.initialVersion_ === 2 &&
                      goog.isDefAndNotNull(stateBgLayerLabel)) {
                    stateBgLayerLabel =
                        app.LayerPermalinkManager.
                        V2_BGLAYER_TO_V3_[stateBgLayerLabel];
                  } else if (this.initialVersion_ === 2 &&
                      parseInt(stateBgLayerOpacity, 0) === 0) {
                    stateBgLayerLabel = 'orthogr_2013_global';
                  }
                } else {
                  if (!goog.isDef(mapId)) {
                    stateBgLayerLabel = 'basemap_2015_global';
                  } else {
                    if (this.appTheme_.getCurrentTheme() === 'tourisme') {
                      stateBgLayerLabel = 'topo_bw_jpeg';
                    } else {
                      stateBgLayerLabel = 'topogg';
                    }
                  }
                  stateBgLayerOpacity = 0;
                }
              } else {
                stateBgLayerLabel = this.ngeoLocation_.getParam('bgLayer');
                stateBgLayerOpacity =
                    this.ngeoLocation_.getParam('bgOpacity');
              }
              var hasBgLayerInUrl = goog.isDef(this.ngeoLocation_.getParam('bgLayer'));
              if (!goog.isDef(mapId) || hasBgLayerInUrl) {
                var layer = /** @type {ol.layer.Base} */
                    (goog.array.find(bgLayers, function(layer) {
                      return layer.get('label') === stateBgLayerLabel;
                    }));
                this.backgroundLayerMgr_.set(this.map_, layer);
              }
              this.appThemes_.getFlatCatalog().then(
                  goog.bind(function(flatCatalogue) {
                    /**
                     * @type {Array.<number>|undefined}
                     */
                    var layerIds = [];
                    /**
                     * @type {Array.<number>|undefined}
                     */
                    var opacities = [];
                    if (!this.initialized_) {
                      if (this.initialVersion_ === 2) {
                        var layerString = this.stateManager_.
                            getInitialValue('layers');
                        if (goog.isDefAndNotNull(layerString) &&
                            !goog.string.isEmpty(layerString)) {
                          var layers = layerString.split(',');
                          goog.array.forEach(layers,
                              function(stateLayerLabel) {
                                var layer = goog.array.find(flatCatalogue,
                                    function(catalogueLayer) {
                                      return catalogueLayer['name'] ===
                                          stateLayerLabel;
                                    }, this);
                                layerIds.push(layer['id']);
                              }, this);
                        }
                        var opacitiesString = this.stateManager_.
                            getInitialValue('layers_opacity');
                        var visibilitiesString = this.stateManager_.
                            getInitialValue('layers_visibility');
                        if (goog.isDefAndNotNull(opacitiesString) &&
                            goog.isDefAndNotNull(visibilitiesString) &&
                            !goog.string.isEmpty(visibilitiesString) &&
                            !goog.string.isEmpty(opacitiesString)) {
                          var visibilities = visibilitiesString.split(',');
                          goog.array.forEach(
                              opacitiesString.split(','),
                              function(opacity, index) {
                                if (visibilities[index] === 'true') {
                                  opacities.push(parseFloat(opacity));
                                } else {
                                  opacities.push(0);
                                }
                              });
                        }
                        layerIds.reverse();
                        opacities.reverse();

                        this.stateManager_.deleteParam('layers_indices');
                        this.stateManager_.deleteParam('layers_opacity');
                        this.stateManager_.deleteParam('layers_visibility');
                        this.stateManager_.deleteParam('bgOpacity');

                      } else {
                        layerIds = this.getStateValue_('layers');
                        opacities = this.getStateValue_('opacities');
                      }
                      this.setupWatchers_(selectedLayers);
                      this.initialized_ = true;
                    } else {
                      layerIds = this.splitLayers_(
                          this.ngeoLocation_.getParam('layers'), '-');
                      opacities = this.splitNumbers_(
                          this.ngeoLocation_.getParam('opacities'), '-');
                    }
                    if (goog.isDef(layerIds) && goog.isDef(opacities) &&
                        layerIds.length > 0 &&
                        layerIds.length === opacities.length) {
                      this.applyLayerStateToMap_(layerIds, opacities,
                          flatCatalogue);
                    }
                  }, this));
            }, this));
      }, this);
    };

app.module.service('appLayerPermalinkManager', app.LayerPermalinkManager);
