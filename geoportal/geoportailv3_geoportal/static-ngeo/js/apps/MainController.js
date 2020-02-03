/**
 * @module app.apps.MainController
 */
/**
 * @fileoverview This file defines the controller class for the application's
 * main controller (created using "ng-controller" in the page).
 *
 * In particular, this controller creates the OpenLayers map, and makes it
 * available in the controller for use from other parts (directives) of the
 * application. It also defines the behavior of elements of the HTML page (the
 * management of the sidebar for example).
 */

import 'core-js';
import 'jquery';
import 'bootstrap';
import 'angular';
import 'angular-gettext';
import 'angular-dynamic-locale';

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

import appModule from '../module.js';
import appLocationControl from '../LocationControl.js';
import appMap from '../Map.js';
import olFeature from 'ol/Feature.js';
import olGeomPoint from 'ol/geom/Point.js';
import {defaults as interactionDefaults} from 'ol/interaction.js';
import LayerGroup from 'ol/layer/Group';
import olLayerVector from 'ol/layer/Vector.js';
import ngeoMiscSyncArrays from 'ngeo/misc/syncArrays.js';
import olView from 'ol/View.js';
import olControlAttribution from 'ol/control/Attribution.js';
import olControlFullScreen from 'ol/control/FullScreen.js';
import olControlOverviewMap from 'ol/control/OverviewMap.js';
import olControlZoom from 'ol/control/Zoom.js';
import appOlcsZoomToExtent from '../olcs/ZoomToExtent.js';
import appOlcsLux3DManager from '../olcs/Lux3DManager.js';
import {transform, transformExtent} from 'ol/proj.js';
import {toRadians} from 'ol/math.js';

import '../../less/geoportailv3.less'

 /* eslint-disable no-unused-vars */
 import appAskredirectAskredirectDirective from '../askredirect/askredirectDirective.js';
 import appAskredirectAskredirectController from '../askredirect/AskredirectController.js';
 import appAuthenticationAuthenticationDirective from '../authentication/authenticationDirective.js';
 import appAuthenticationAuthenticationController from '../authentication/AuthenticationController.js';
 import appBackgroundlayerBackgroundlayerDirective from '../backgroundlayer/backgroundlayerDirective.js';
 import appBackgroundlayerBackgroundlayerController from '../backgroundlayer/BackgroundlayerController.js';
 import appBackgroundlayerBlankLayer from '../backgroundlayer/BlankLayer.js';
 import appCatalogCatalogController from '../catalog/CatalogController.js';
 import appCatalogCatalogDirective from '../catalog/catalogDirective.js';
 import appDrawDrawDirective from '../draw/drawDirective.js';
 import appDrawDrawController from '../draw/DrawController.js';
 import appDrawDrawnFeatures from '../draw/DrawnFeatures.js';
 import appDrawFeatureHash from '../draw/FeatureHash.js';
 import appDrawFeaturePopup from '../draw/FeaturePopup.js';
 import appDrawFeaturePopupController from '../draw/FeaturePopupController.js';
 import appDrawFeaturePopupDirective from '../draw/featurePopupDirective.js';
 import appDrawRouteControl from '../draw/RouteControl.js';
 import appGetLayerForCatalogNodeFactory from '../GetLayerForCatalogNodeFactory.js';

 //const appDrawRouteControlOptions = goog.require('app.draw.RouteControlOptions');
 import appDrawSelectedFeatures from '../draw/SelectedFeaturesService.js';
 import AppImguploadController from '../imageupload/ImguploadController.js'
 import appImgupload from '../imageupload/ImguploadDirective.js'
 import appDrawStyleEditingController from '../draw/StyleEditingController.js';
 import appDrawStyleEditingDirective from '../draw/styleEditingDirective.js';
 import appDrawSymbolSelectorController from '../draw/SymbolSelectorController.js';
 import appDrawSymbolSelectorDirective from '../draw/symbolSelectorDirective.js';
 import appExclusionManager from '../ExclusionManager.js';
 import appExternaldataExternalDataDirective from '../externaldata/externalDataDirective.js';
 import appExternaldataExternalDataController from '../externaldata/ExternalDataController.js';
 import appFeedbackFeedbackDirective from '../feedback/feedbackDirective.js';
 import appFeedbackFeedbackController from '../feedback/FeedbackController.js';
 import appFeedbackanfFeedbackanfDirective from '../feedbackanf/feedbackanfDirective.js';
 import appFeedbackcruesFeedbackcruesDirective from '../feedbackcrues/feedbackcruesDirective.js';
 import appFeedbackageFeedbackcruesController from '../feedbackcrues/FeedbackcruesController.js';
 import appFeedbackageFeedbackageDirective from '../feedbackage/feedbackageDirective.js';
 import appFeedbackanfFeedbackanfController from '../feedbackanf/FeedbackanfController.js';
 import appFeedbackageFeedbackageController from '../feedbackage/FeedbackageController.js';
 import appInfobarElevationDirective from '../infobar/elevationDirective.js';
 import appInfobarElevationController from '../infobar/ElevationController.js';
 import appInfobarInfobarController from '../infobar/InfobarController.js';
 import appInfobarInfobarDirective from '../infobar/infobarDirective.js';
 import appInfobarProjectionselectorDirective from '../infobar/projectionselectorDirective.js';
 import appInfobarProjectionselectorController from '../infobar/ProjectionselectorController.js';
 import appInfobarScalelineDirective from '../infobar/scalelineDirective.js';
 import appInfobarScalelineController from '../infobar/ScalelineController.js';
 import appInfobarScaleselectorDirective from '../infobar/scaleselectorDirective.js';
 import appInfobarScaleselectorController from '../infobar/ScaleselectorController.js';
 import appLayerinfoLayerinfoDirective from '../layerinfo/layerinfoDirective.js';
 import appLayerinfoLayerinfoController from '../layerinfo/LayerinfoController.js';
 import appLocationinfoLocationInfoOverlay from '../locationinfo/LocationInfoOverlay.js';
 import appLayerinfoShowLayerinfo from '../layerinfo/ShowLayerinfoFactory.js';
 import appLayermanagerLayermanagerDirective from '../layermanager/layermanagerDirective.js';
 import appLayermanagerLayermanagerController from '../layermanager/LayermanagerController.js';
 import appLayerlegendsLayerlegendsDirective from '../layerlegends/layerlegendsDirective.js';
 import appLayerlegendsLayerlegendsController from '../layerlegends/LayerlegendsController.js';
 import appLocationinfoLocationinfoDirective from '../locationinfo/locationinfoDirective.js';
 import appLocationinfoLocationinfoController from '../locationinfo/LocationinfoController.js';
 import appLotChasse from '../LotChasse.js';
 import appMapMapDirective from '../map/mapDirective.js';
 import appMapMapController from '../map/MapController.js';
 import appMainController from './MainController.js';
 import appMymapsFilereaderDirective from '../mymaps/filereaderDirective.js';
 import appMeasureMeasureController from '../measure/MeasureController.js';
 import appMeasureMeasureDirective from '../measure/MeasureDirective.js';
 import appMymapsMymapsDirective from '../mymaps/mymapsDirective.js';
 import appMymapsMymapsController from '../mymaps/MymapsController.js';
 import appNotify from '../NotifyFactory.js';
 import appPrintPrintDirective from '../print/printDirective.js';
 import appPrintPrintController from '../print/PrintController.js';
 import appPrintPrintservice from '../print/Printservice.js';
 import appProfileProfileDirective from '../profile/profileDirective.js';
 import appProfileProfileController from '../profile/ProfileController.js';
 import appQueryPagreportDirective from '../query/pagreportDirective.js';
 import appQueryPagreportController from '../query/PagreportController.js';
 import appQueryCasiporeportDirective from '../query/casiporeportDirective.js';
 import appQueryCasiporeportController from '../query/CasiporeportController.js';
 import appQueryPdsreportDirective from '../query/pdsreportDirective.js';
 import appQueryPdsreportController from '../query/PdsreportController.js';

 //const appQueryQueryStyles = goog.require('app.query.QueryStyles');
 import appQueryQueryDirective from '../query/queryDirective.js';

 import appQueryQueryController from '../query/QueryController.js';
 import appResizemapDirective from '../resizemapDirective.js';
 import appRoutingRoutingController from '../routing/RoutingController.js';
 import appRoutingRoutingDirective from '../routing/routingDirective.js';
 import appSearchSearchDirective from '../search/searchDirective.js';
 import appSearchSearchController from '../search/SearchController.js';
 import appShareShareDirective from '../share/ShareDirective.js';
 import appShareShareController from '../share/ShareController.js';
 import appShareShorturlDirective from '../share/shorturlDirective.js';
 import appShareShorturlController from '../share/ShorturlController.js';
 import appSliderSliderDirective from '../slider/SliderDirective.js';
 import appSliderSliderController from '../slider/SliderController.js';
 import appStreetviewStreetviewDirective from '../streetview/streetviewDirective.js';
 import appStreetviewStreetviewController from '../streetview/StreetviewController.js';
 import appThemeswitcherThemeswitcherDirective from '../themeswitcher/themeswitcherDirective.js';
 import appThemeswitcherThemeswitcherController from '../themeswitcher/ThemeswitcherController.js';
 import appActivetool from '../Activetool.js';
 import appCoordinateString from '../CoordinateStringService.js';
 import appExport from '../Export.js';
 import appGeocoding from '../Geocoding.js';
 import appGetDevice from '../GetDevice.js';
 import appGetElevation from '../GetElevationService.js';
 import appGetProfile from '../GetProfileService.js';
 import appGetShorturl from '../GetShorturlService.js';
 import appGetWmsLayer from '../GetWmsLayerFactory.js';
 import appGetWmtsLayer from '../GetWmtsLayerFactory.js';
 import appLayerOpacityManager from '../LayerOpacityManager.js';
 import appLayerPermalinkManager from '../LayerPermalinkManager.js';

 // const appLocationControlOptions = goog.require('app.LocationControlOptions');
 //const appMapsResponse = goog.require('app.MapsResponse');
 import appMymaps from '../Mymaps.js';

 import appMymapsOffline from '../MymapsOffline.js';
 import appOlcsToggle3d from '../olcs/toggle3d.js';
 import appOlcsExtent from '../olcs/Extent.js';
 import appProjections from '../projections.js';
 import appRouting from '../Routing.js';
 import appScalesService from '../ScalesService.js';
 import appStateManager from '../StateManager.js';
 import appTheme from '../Theme.js';
 import appThemes from '../Themes.js';

 //const appThemesResponse = goog.require('app.ThemesResponse');
 import appUserManager from '../UserManager.js';

 import appWmsHelper from '../WmsHelper.js';
 import appWmtsHelper from '../WmtsHelper.js';
 import appMiscFile from '../misc/file.js';

 import OfflineDownloader from '../OfflineDownloader.js';
 import OfflineRestorer from '../OfflineRestorer.js';
 /* eslint-enable no-unused-vars */


/**
 * @param {angular.Scope} $scope Scope.
 * @param {ngeo.map.FeatureOverlayMgr} ngeoFeatureOverlayMgr Feature overlay
 * manager.
 * @param {ngeo.map.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer
 * manager.
 * @param {ngeo.offline.ServiceManager} ngeoOfflineServiceManager offline service manager service.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {app.ExclusionManager} appExclusionManager Exclusion manager service.
 * @param {app.LayerOpacityManager} appLayerOpacityManager Layer opacity.
 * @param {app.LayerPermalinkManager} appLayerPermalinkManager Permalink
 * service.
 * @param {app.Mymaps} appMymaps Mymaps service.
 * @param {app.StateManager} appStateManager The state service.
 * @param {app.Themes} appThemes Themes service.
 * @param {app.Theme} appTheme the current theme service.
 * @param {app.UserManager} appUserManager The user manager service.
 * @param {app.draw.DrawnFeatures} appDrawnFeatures Drawn features service.
 * @param {Object.<string, string>} langUrls URLs to translation files.
 * @param {Array.<number>} maxExtent Constraining extent.
 * @param {Array.<number>} defaultExtent Default geographical extent.
 * @param {ngeo.statemanager.Location} ngeoLocation ngeo location service.
 * @param {app.Export} appExport The export GPX/KML service.
 * @param {app.GetDevice} appGetDevice The device service.
 * @param {boolean} appOverviewMapShow Add or not the overview control.
 * @param {string} showCruesLink Enable the Crues link.
 * @param {boolean} showAnfLink Enable the ANF link.
 * @param {string} appOverviewMapBaseLayer The layer displayed in overview.
 * @param {app.Notify} appNotify Notify service.
 * @param {angular.$window} $window Window.
 * @param {app.draw.SelectedFeatures} appSelectedFeatures Selected features service.
 * @param {angular.$locale} $locale The locale service.
 * @param {app.Routing} appRouting The routing service.
 * @param {Document} $document Document.
 * @param {string} cesiumURL The Cesium script URL.
 * @param {angular.Scope} $rootScope Angular root scope.
 * @param {ngeo.olcs.Service} ngeoOlcsService The service.
 * @param {Array<string>} tiles3dLayers 3D tiles layers.
 * @param {string} tiles3dUrl 3D tiles server url.
 * @param {ngeo.offline.NetworkStatus} ngeoNetworkStatus ngeo network status service.
 * @param {ngeo.offline.Mode} ngeoOfflineMode Offline mode manager.
 * @param {string} ageLayerIds ID of AGE layers.
 * @param {string} showAgeLink Enable the AGE link.
 * @param {app.GetLayerForCatalogNode} appGetLayerForCatalogNode Tje layer
 * catalog service.
 * @param {string} showCruesRoles Enable the Crues link only for these roles.
 * @param {string} ageCruesLayerIds ID of flashflood layers.
 * @param {app.MymapsOffline} appMymapsOffline Offline mymaps service
 * @constructor
 * @export
 * @ngInject
 */
const MainController = function(
    $scope, ngeoFeatureOverlayMgr, ngeoBackgroundLayerMgr, ngeoOfflineServiceManager,
    gettextCatalog, appExclusionManager, appLayerOpacityManager,
    appLayerPermalinkManager, appMymaps, appStateManager, appThemes, appTheme,
    appUserManager, appDrawnFeatures, langUrls, maxExtent, defaultExtent,
    ngeoLocation, appExport, appGetDevice,
    appOverviewMapShow, showCruesLink, showAnfLink, appOverviewMapBaseLayer, appNotify, $window,
    appSelectedFeatures, $locale, appRouting, $document, cesiumURL,
    $rootScope, ngeoOlcsService, tiles3dLayers, tiles3dUrl, ngeoNetworkStatus, ngeoOfflineMode,
    ageLayerIds, showAgeLink, appGetLayerForCatalogNode,
    showCruesRoles, ageCruesLayerIds, appOfflineDownloader, appOfflineRestorer, appMymapsOffline) {

  appUserManager.setOfflineMode(ngeoOfflineMode); // avoid circular dependency
  appMymaps.setOfflineMode(ngeoOfflineMode);
  appMymaps.setOfflineService(appMymapsOffline);

  /**
   * @type {string}
   * @private
   */
  this.ageCruesLayerIds_ = ageCruesLayerIds;

  /**
   * @type {app.GetLayerForCatalogNode}
   * @private
   */
  this.getLayerFunc_ = appGetLayerForCatalogNode;

  /**
   * @type {boolean}
   * @export
   */
  this.activeLayersComparator = false;

  /**
   * @type {boolean}
   * @export
   */
  this.showCruesLinkOrig = (showCruesLink === 'true');

  /**
   * @type {boolean}
   * @export
   */
  this.showCruesLink = false;

  /**
   * @type {string}
   * @export
   */
  this.showCruesRoles = showCruesRoles;

  /**
   * @type {boolean}
   * @export
   */
  this.showAnfLink = showAnfLink;

  /**
   * @type {boolean}
   * @export
   */
  this.showAgeLink = (showAgeLink === 'true');

  /**
   * @private
   */
  this.appOfflineRestorer_ = appOfflineRestorer;

  /**
   * @type {Document}
   * @private
   */
  this.$document_ = $document;

  /**
   * @type {app.Routing}
   * @export
   */
  this.appRouting_ = appRouting;

  /**
   * @type {angular.$locale}
   * @private
   */
  this.locale_ = $locale;

  /**
   * @type {ol.Collection<ol.Feature>}
   * @private
   */
  this.selectedFeatures_ = appSelectedFeatures;

  /**
   * @type {angular.$window}
   * @private
   */
  this.window_ = $window;

  /**
   * @type {app.Notify}
   * @private
   */
  this.notify_ = appNotify;

  /**
   * @private
   * @type {app.GetDevice}
   */
  this.appGetDevice_ = appGetDevice;

  /**
   * @type {app.Export}
   * @private
   */
  this.appExport_ = appExport;

  /**
   * @type {ngeo.statemanager.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {ngeo.map.BackgroundLayerMgr}
   * @private
   */
  this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;

  /**
   * @type {app.draw.DrawnFeatures}
   * @private
   */
  this.drawnFeatures_ = appDrawnFeatures;

  /**
   * @type {app.UserManager}
   * @private
   */
  this.appUserManager_ = appUserManager;

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {app.StateManager}
   * @private
   */
  this.stateManager_ = appStateManager;

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
   * @type {ngeo.offline.NetworkStatus}
   * @private
   */
  this.networkStatus_ = ngeoNetworkStatus;

  /**
   * @type {ngeo.offline.Mode}
   * @export
   */
  this.offlineMode = ngeoOfflineMode;

  /**
   * @private
   * @type {Array<string>}
   */
  this.tiles3dLayers_ = tiles3dLayers;

  /**
   * @private
   * @type {string}
   */
  this.tiles3dUrl_ = tiles3dUrl;

  /**
   * @type {ngeo.offline.NetworkStatus}
   * @export
   */
  this.ngeoNetworkStatus = ngeoNetworkStatus;

  /**
   * @type {ol.Extent}
   * @private
   */
  this.maxExtent_ =
      transformExtent(maxExtent, 'EPSG:4326', 'EPSG:3857');

  /**
   * @type {angularGettext.Catalog}
   * @private
   */
  this.gettextCatalog_ = gettextCatalog;

  /**
   * @type {Object.<string, string>}
   * @private
   */
  this.langUrls_ = langUrls;

  /**
   * @type {Array.<number>}
   * @private
   */
  this.defaultExtent_ = defaultExtent;

  /**
   * @type {boolean}
   */
  this['hasRoutingResult'] = false;

  /**
   * @type {boolean}
   */
  this['sidebarActive'] = false;

  /**
   * @type {boolean}
   */
  this['languageOpen'] = false;

  /**
   * @type {boolean}
   */
  this['drawOpen'] = false;

  /**
   * @type {boolean}
   */
  this['drawOpenMobile'] = false;

  /**
   * @type {boolean}
   */
  this['infosOpen'] = false;

  /**
   * @type {boolean}
   */
  this['feedbackOpen'] = false;

  /**
   * @type {boolean}
   */
  this['feedbackCruesOpen'] = false;

  /**
   * @type {boolean}
   */
  this['feedbackAnfOpen'] = false;

  /**
   * @type {boolean}
   */
  this['feedbackAgeOpen'] = false;

  /**
   * @type {boolean}
   */
  this['legendsOpen'] = false;

  /**
   * @type {boolean}
   */
  this['routingOpen'] = false;

  /**
   * @type {boolean}
   */
  this['layersOpen'] = false;

  /**
   * @type {boolean}
   */
  this['measureOpen'] = false;

  /**
   * @type {boolean}
   */
  this['mymapsOpen'] = false;

  /**
   * @type {boolean}
   */
  this['printOpen'] = false;

  /**
   * @type {boolean}
   */
  this['shareOpen'] = false;

  /**
   * @type {boolean}
   */
  this['shareMymapsChecked'] = false;

  /**
   * @type {boolean}
   */
  this['shareShowLongUrl'] = false;

  /**
   * @type {boolean}
   */
  this['userOpen'] = false;

  /**
   * @type {boolean}
   */
  this['infosHiddenContent'] = false;

  /**
   * @type {boolean}
   */
  this['showRedirect'] = false;

  /**
   * @type {string|undefined}
   */
  this['infosAppSelector'] = undefined;

  /**
   * @type {Array}
   */
  this['selectedLayers'] = [];

  /**
   * @type {Array}
   */
  this['ageLayers'] = [];

  /**
   * Set to true to display the change icon in Mymaps.
   * @type {boolean}
   */
  this['layersChanged'] = false;

  const initial3dTilesVisibleValue = appStateManager.getInitialValue('3dtiles_visible');

  /**
   * @export
   */
  this.debugOffline = ngeoLocation.hasParam('debugOffline');

  /**
   * True if no initial state is defined.
   * @type {boolean}
   * @export
   */
  this.tiles3dVisible = initial3dTilesVisibleValue !== undefined ? initial3dTilesVisibleValue === 'true' : true;

  /**
   * @type {app.Mymaps}
   * @private
   */
  this.appMymaps_ = appMymaps;
  this.appUserManager_.getUserInfo();

  /**
   * @const {!app.Map}
   * @private
   */
  this.map_ = this.createMap_();

  /**
   * @const {?app.olcs.Lux3DManager}
   * @export
   */
  this.ol3dm_ = this.createCesiumManager_(cesiumURL, $rootScope);
  this.ol3dm_.on('load', () => {
    this.ol3dm_.init3dTiles(this.tiles3dVisible);
  });

  ngeoOlcsService.initialize(this.ol3dm_);
  $scope.$watch(() => this.is3dEnabled(), this.enable3dCallback_.bind(this));
  this.map_.set('ol3dm', this.ol3dm_);

  // Add the zoom to extent control in a second step since it depends on ol3dm.
  this.map_.addControl(new appOlcsZoomToExtent(this.defaultExtent_, this.ol3dm_));

  this.initLanguage_();

  this.initMymaps_();

  this.manageSelectedLayers_($scope);

  appExclusionManager.init(this.map_);
  appLayerOpacityManager.init(this.map_);
  ngeoFeatureOverlayMgr.init(this.map_);
  appLayerPermalinkManager.init($scope, this.map_, this['selectedLayers']);
  $scope.$watch(function() {
    return appLayerPermalinkManager.hasUnavailableLayers();
  }.bind(this), function(newVal, oldVal) {
    if (newVal !== null && oldVal !== null && newVal !== oldVal && newVal === true) {
      this['userOpen'] = true;
    }
  }.bind(this));

  this.appExport_.init(this.map_);

  this.addLocationControl_(ngeoFeatureOverlayMgr);

  this.manageUserRoleChange_($scope);
  this.loadThemes_().then(function() {
    this.appThemes_.getBgLayers().then(
          function(bgLayers) {
            if (appOverviewMapShow) {
              var layer = /** @type {ol.layer.Base} */
                (bgLayers.find(function(layer) {
                  return layer.get('label') === appOverviewMapBaseLayer;
                }));
              this.map_.addControl(
                new olControlOverviewMap(
                  {layers: [layer],
                    collapseLabel: '\u00BB',
                    label: '\u00AB'}));
            }
          }.bind(this));
    this['ageLayers'].splice(0, this['ageLayers'].length);

    this.appThemes_.getFlatCatalog().then(
      function(flatCatalogue) {
      flatCatalogue.forEach(function(catItem) {
        var layerIdsArray = ageLayerIds.split(',');
        if (layerIdsArray.indexOf('' + catItem.id) >= 0) {
          var layer = this.getLayerFunc_(catItem);
          if (this['ageLayers'].indexOf(layer) < 0) {
            this['ageLayers'].push (layer);
          }
        }
      }.bind(this));
    }.bind(this));

    this['feedbackAgeOpen'] = ('true' === this.ngeoLocation_.getParam('feedbackage'));
    this['feedbackAnfOpen'] = ('true' === this.ngeoLocation_.getParam('feedbackanf'));
    this['feedbackCruesOpen'] = ('true' === this.ngeoLocation_.getParam('feedbackcrues'));
    var urlLocationInfo = appStateManager.getInitialValue('crosshair');
    var infoOpen = urlLocationInfo !== undefined && urlLocationInfo !== null &&
      urlLocationInfo === 'true';
    this['layersOpen'] = (!this.appGetDevice_.testEnv('xs') &&
    !this['routingOpen'] &&
    this.ngeoLocation_.getParam('map_id') === undefined &&
    !infoOpen &&
    !this['feedbackCruesOpen'] &&
    !this['feedbackAnfOpen'] &&
    !this['feedbackAgeOpen'] &&
    this.stateManager_.getValueFromLocalStorage('layersOpen') !== 'false') ?
    true : false;
    this['mymapsOpen'] = (!this.appGetDevice_.testEnv('xs') &&
        this.ngeoLocation_.getParam('map_id') !== undefined &&
        !this['feedbackCruesOpen'] &&
        !this['feedbackAnfOpen'] &&
        !this['feedbackAgeOpen'] &&
        !infoOpen) ? true : false;
    $scope.$watch(function() {
      return this['layersOpen'];
    }.bind(this), function(newVal) {
      if (newVal === false) {
        $('app-catalog .themes-switcher').collapse('show');
        $('app-themeswitcher #themes-content').collapse('hide');
      }
    }.bind(this));
    this.activeLayersComparator = (this.ngeoLocation_.getParam('lc') === 'true');

    $scope.$watch(function() {
      return this.sidebarOpen();
    }.bind(this), function(newVal) {
      this.stateManager_.updateStorage({
        'layersOpen': newVal
      });
      if (this['mymapsOpen'] && this.appGetDevice_.testEnv('xs') &&
          this.selectedFeatures_.getLength() > 0) {
        var feature = this.selectedFeatures_.getArray()[0];
        feature.set('__refreshProfile__', true);
      }
    }.bind(this));

    this.appThemes_.getThemeObject(
      this.appTheme_.getCurrentTheme()).then(function() {
        var zoom = Number(appStateManager.getInitialValue('zoom'));
        if (zoom > 19) {
          this.map_.getView().setZoom(zoom);
        }
      }.bind(this));
  }.bind(this));
  var waypoints = appStateManager.getInitialValue('waypoints');
  if (waypoints !== undefined && waypoints !== null) {
    this['routingOpen'] = true;
    var criteria = parseInt(appStateManager.getInitialValue('criteria'), 10);
    var transportMode = parseInt(
      appStateManager.getInitialValue('transportMode'), 10);
    this.appRouting_.criteria = criteria;
    this.appRouting_.transportMode = transportMode;
    var coordinates = waypoints.split(',');
    var i = 0;
    var routeNumber = 1;
    this.appRouting_.routesOrder.splice(0, this.appRouting_.routesOrder.length);
    for (i = 0; i < coordinates.length; i = i + 2) {
      var position = [
        parseFloat(coordinates[i + 1]), parseFloat(coordinates[i])];
      var feature = new olFeature({
        geometry: new olGeomPoint((transform(position, 'EPSG:4326', 'EPSG:3857')))
      });
      feature.set('label', '' + routeNumber);
      this.appRouting_.insertFeatureAt(feature, routeNumber);
      this.appRouting_.routesOrder.push(routeNumber - 1);
      routeNumber++;
    }
    if (i > 1) {
      var labels = appStateManager.getInitialValue('labels');
      this.appRouting_.routes  = labels.split('||');
      this.appRouting_.getRoute();
    }
  }

  $scope.$watch(this.isDisconnectedOrOffline.bind(this), (offline) => {
    if (offline) {
      if (this.sidebarOpen() && !this['layersOpen'] && !this['mymapsOpen']) {
        this.closeSidebar();
        this['layersOpen'] = true;
      }
      this.showTab('a[href=\'#mylayers\']');
    }
  });

  ngeoOfflineServiceManager.setSaveService(appOfflineDownloader);
  ngeoOfflineServiceManager.setRestoreService(appOfflineRestorer);

  Sentry.init({
    dsn: 'https://a74e513e9cb84d5a9a2cd24a46d260a8@sentry.geoportail.lu/4',
    integrations: [
      new Integrations.Angular(),
    ],
  });
};


/**
 * @private
 * @param {boolean} active 3d state
 */
MainController.prototype.enable3dCallback_ = function(active) {
  if (!active) {
    return;
  }
  var piwik = /** @type {Piwik} */ (this.window_['_paq']);
  piwik.push(['setDocumentTitle', 'enable3d']);
  piwik.push(['trackPageView']);

  this['drawOpen'] = false;
  this['drawOpenMobile'] = false;
  this['measureOpen'] = false;
  this['printOpen'] = false;
};

/**
 * @param {ngeo.map.FeatureOverlayMgr} featureOverlayMgr Feature overlay manager.
 * @private
 */
MainController.prototype.addLocationControl_ = function(featureOverlayMgr) {
    var isActive = false;
    var activateGeoLocation = this.ngeoLocation_.getParam('tracking');
    if (activateGeoLocation && 'true' === activateGeoLocation) {
      isActive = true;
      this.ngeoLocation_.deleteParam('tracking');
    }
    var locationControl = new appLocationControl(/** @type {app.LocationControlOptions} */({
      label: '\ue800',
      featureOverlayMgr: featureOverlayMgr,
      notify: this.notify_,
      gettextCatalog: this.gettextCatalog_,
      scope: this.scope_,
      window: this.window_
    }));
    this.map_.addControl(locationControl);
    if (isActive) {
      this.map_.once('change:view', (e) => {
        locationControl.handleCenterToLocation();
      });
    }
  };


/**
 * @private
 * @return {!app.Map} The extended ol.Map.
 */
MainController.prototype.createMap_ = function() {
  var interactions = interactionDefaults({
    altShiftDragRotate: false,
    pinchRotate: false,
    constrainResolution: true
  });
  var map = this['map'] = new appMap({
    logo: false,
    controls: [
      new olControlZoom({zoomInLabel: '\ue032', zoomOutLabel: '\ue033'}),
      // the zoom to extent control will be added later since it depends on ol3dm
      new olControlFullScreen({label: '\ue01c', labelActive: '\ue02c'}),
      new olControlAttribution({collapsible: false,
        collapsed: false, className: 'geoportailv3-attribution'})
    ],
    interactions: interactions,
    keyboardEventTarget: document,
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true,
    view: new olView({
      maxZoom: 19,
      minZoom: 8,
      enableRotation: false,
      extent: this.maxExtent_
    })
  });
  return map;
};


/**
 * @private
 * @param {string} cesiumURL The Cesium URL
 * @param {angular.Scope} $rootScope The root scope
 * @return {!app.olcs.Lux3DManager} The created manager.
 */
MainController.prototype.createCesiumManager_ = function(cesiumURL, $rootScope) {
  // [minx, miny, maxx, maxy]
  console.assert(this.map_ !== null && this.map_ !== undefined);
  const cameraExtentInRadians = [5.31, 49.38, 6.64, 50.21].map(toRadians);
  return new appOlcsLux3DManager(cesiumURL, cameraExtentInRadians, this.map_, this.ngeoLocation_,
    $rootScope, this.tiles3dLayers_, this.tiles3dUrl_);
};


/**
 * @export
 * @return {boolean} Whether 3D is active.
 */
MainController.prototype.is3dEnabled = function() {
  return this.ol3dm_.is3dEnabled();
};


/**
 * Register a watcher on "roleId" to reload the themes when the role id
 * changes.
 * @param {angular.Scope} scope Scope.
 * @private
 */
MainController.prototype.manageUserRoleChange_ = function(scope) {
  scope.$watch(function() {
    return this.appUserManager_.roleId;
  }.bind(this), function(newVal, oldVal) {
    if (newVal === null && oldVal === null) {
      // This happens at init time. We don't want to reload the themes
      // at this point, as the constructor already loaded them.
      return;
    }
    this.showCruesLink = false;
    if (this.showCruesLinkOrig && newVal !== null) {
      var roles = this.showCruesRoles.split(',');
      var found = roles.find(function(element) {
        return element === ('' + newVal);
      }, this);
      this.showCruesLink = (found !== undefined);
    }
    this.loadThemes_();
    if (this.appMymaps_.isMymapsSelected()) {
      this.appMymaps_.loadMapInformation();
    }
  }.bind(this));
};


/**
 * @private
 * @return {?angular.$q.Promise} Promise.
 */
MainController.prototype.loadThemes_ = function() {
  return this.appThemes_.loadThemes(this.appUserManager_.roleId);
};


/**
 * @param {angular.Scope} scope Scope
 * @private
 */
MainController.prototype.manageSelectedLayers_ =
    function(scope) {
      ngeoMiscSyncArrays(
        this.map_.getLayers().getArray(),
        this['selectedLayers'], true, scope,
        function(layer) {
          if (layer instanceof olLayerVector && layer.get('altitudeMode') === 'clampToGround') {
            return false;
          }
          if (layer instanceof LayerGroup && layer.get('groupName') === 'background') {
            return false;
          }
          return this.map_.getLayers().getArray().indexOf(layer) !== 0;
        }.bind(this)
      );
      scope.$watchCollection(function() {
        return this['selectedLayers'];
      }.bind(this), function(newSelectedLayers, oldSelectedLayers) {
        this.map_.render();
        this.compareLayers_();

        if (newSelectedLayers.length > oldSelectedLayers.length) {
          var nbLayersAdded =
             newSelectedLayers.length - oldSelectedLayers.length;
          for (var i = 0; i < nbLayersAdded; i++) {
            var layer = this['selectedLayers'][i];
            var piwik = /** @type {Piwik} */ (this.window_['_paq']);
            piwik.push(['setDocumentTitle',
              'LayersAdded/' + layer.get('label')
            ]);
            piwik.push(['trackPageView']);
          }
        }
      }.bind(this));
    };

/**
 * @export
 */
MainController.prototype.openFeedback = function() {
  if (this.sidebarOpen()) {
    this.closeSidebar();
    this['feedbackOpen'] = true;
  } else {
    this['feedbackOpen'] = true;
  }
};


/**
 * @export
 */
MainController.prototype.openFeedbackAnf = function() {
  this.appThemes_.getFlatCatalog().then(
    function(flatCatalogue) {
      var node = flatCatalogue.find(function(catItem) {
        return catItem.id == 1640;
      });
      if (node !== undefined && node !== null) {
        var layer = this.getLayerFunc_(node);
        var idx = this.map_.getLayers().getArray().indexOf(layer);
        if (idx === -1) {
          this.map_.addLayer(layer);
        }
      }
    }.bind(this));

  if (this.sidebarOpen()) {
    this.closeSidebar();
    this['feedbackAnfOpen'] = true;
  } else {
    this['feedbackAnfOpen'] = true;
  }
};


/**
 * @export
 */
MainController.prototype.openFeedbackAge = function() {
  if (this.sidebarOpen()) {
    this.closeSidebar();
    this['feedbackAgeOpen'] = true;
  } else {
    this['feedbackAgeOpen'] = true;
  }
};

/**
 * @export
 */
MainController.prototype.openFeedbackCrues = function() {
  this.appThemes_.getFlatCatalog().then(
    function(flatCatalogue) {
      var node = flatCatalogue.find(function(catItem) {
        return catItem.id == this.ageCruesLayerIds_;
      }.bind(this));
      if (node !== undefined && node !== null) {
        var layer = this.getLayerFunc_(node);
        var idx = this.map_.getLayers().getArray().indexOf(layer);
        if (idx === -1) {
          this.map_.addLayer(layer);
        }
      }
    }.bind(this));

  if (this.sidebarOpen()) {
    this.closeSidebar();
    this['feedbackCruesOpen'] = true;
  } else {
    this['feedbackCruesOpen'] = true;
  }
};

/**
 * @export
 */
MainController.prototype.closeSidebar = function() {
  this['mymapsOpen'] = this['layersOpen'] = this['infosOpen'] =
      this['feedbackOpen'] = this['legendsOpen'] = this['routingOpen'] =
      this['feedbackAnfOpen'] = this['feedbackAgeOpen'] =
      this['feedbackCruesOpen'] = false;
};


/**
 * @return {boolean} `true` if the sidebar should be open, otherwise `false`.
 * @export
 */
MainController.prototype.sidebarOpen = function() {
  return this['mymapsOpen'] || this['layersOpen'] || this['infosOpen'] ||
      this['legendsOpen'] || this['feedbackOpen'] || this['feedbackAnfOpen'] ||
      this['routingOpen'] || this['feedbackAgeOpen'] || this['feedbackCruesOpen'];
};


/**
 * @param {string} lang Language code.
 * @param {boolean=} track track page view
 * @export
 */
MainController.prototype.switchLanguage = function(lang, track) {
  if (typeof track !== 'boolean') {
    track = true;
  }
  console.assert(lang in this.langUrls_);
  this.gettextCatalog_.setCurrentLanguage(lang);
  this.gettextCatalog_.loadRemote(this.langUrls_[lang]);
  this.locale_.NUMBER_FORMATS.GROUP_SEP = ' ';
  this['lang'] = lang;

  var piwik = /** @type {Piwik} */ (this.window_['_paq']);
  piwik.push(['setCustomVariable', 1, 'Language', this['lang']]);
  if (track) {
    piwik.push(['trackPageView']);
  }
};


/**
 * @return {string} the current theme.
 * @export
 */
MainController.prototype.getCurrentTheme = function() {
  return this.appTheme_.getCurrentTheme();
};

/**
 * @return {string} the current theme.
 * @export
 */
MainController.prototype.getEncodedCurrentTheme = function() {
  return this.appTheme_.encodeThemeName(this.appTheme_.getCurrentTheme());
};

/**
 * @private
 */
MainController.prototype.initLanguage_ = function() {
  this.scope_.$watch(function() {
    return this['lang'];
  }.bind(this), function(newValue) {
    this.stateManager_.updateState({
      'lang': newValue
    });
  }.bind(this));

  var urlLanguage = /** @type {string|undefined} */
      (this.stateManager_.getInitialValue('lang'));

  if (urlLanguage !== undefined && urlLanguage in this.langUrls_) {
    this.switchLanguage(urlLanguage, false);
    return;
  } else {
    // if there is no information about language preference,
    // fallback to french
    this.switchLanguage('fr', false);
    return;
  }
};


/**
 * @private
 */
MainController.prototype.initMymaps_ = function() {
  var mapId = this.ngeoLocation_.getParam('map_id');

  this.appMymaps_.map = this.map_;
  this.appMymaps_.mapProjection = this.map_.getView().getProjection();
  if (mapId !== undefined) {
    this.appMymaps_.setCurrentMapId(mapId,
        this.drawnFeatures_.getCollection()).then(
          function(features) {
            var x = this.stateManager_.getInitialValue('X');
            var y = this.stateManager_.getInitialValue('Y');

            if (x === undefined && y === undefined &&
                this.drawnFeatures_.getCollection().getLength() > 0) {
              this.map_.getView().fit(this.drawnFeatures_.getExtent(), {
                size: /** @type {ol.Size} */ (this.map_.getSize())
              });
            }
            var layer = this.drawnFeatures_.getLayer();
            if (this.map_.getLayers().getArray().indexOf(layer) === -1) {
              this.map_.addLayer(layer);
            }
          }.bind(this));
  } else {
    this.appMymaps_.clear();
  }
  this.appMymaps_.layersChanged = this['layersChanged'];
  this.map_.getLayerGroup().on('change', () => {
    if (!this.appOfflineRestorer_.restoring) {
      this.compareLayers_();
    }
  });
};


/**
 * Compare the layers of mymaps with selected layers
 * and set layersChanged to true if there is a difference
 * between the displayed layers and the mymaps layers
 * @private
 */
MainController.prototype.compareLayers_ = function() {
  if (this.appMymaps_.isEditable()) {
    this['layersChanged'] = false;
    var backgroundLayer = this.backgroundLayerMgr_.get(this.map_);
    if (backgroundLayer &&
        this.appMymaps_.mapBgLayer !== backgroundLayer.get('label')) {
      this['layersChanged'] = true;
    } else {
      if (this['selectedLayers'].length !== this.appMymaps_.mapLayers.length) {
        this['layersChanged'] = true;
      } else {
        var selectedLabels = [];
        var selectedOpacities = [];
        this['selectedLayers'].forEach(function(item) {
          selectedLabels.push(item.get('label'));
          selectedOpacities.push('' + item.getOpacity());
        });
        selectedLabels.reverse();
        selectedOpacities.reverse();
        if (selectedLabels.join(',') !== this.appMymaps_.mapLayers.join(',')) {
          this['layersChanged'] = true;
        } else {
          if (selectedOpacities.join(',') !==
              this.appMymaps_.mapLayersOpacities.join(',')) {
            this['layersChanged'] = true;
          }
        }
      }
    }
  } else {
    this['layersChanged'] = false;
  }
};


/**
 * @param {string} selector JQuery selector for the tab link.
 * @export
 */
MainController.prototype.showTab = function(selector) {
  $(selector).tab('show');
};


/**
 * @export
 */
MainController.prototype.toggleThemeSelector = function() {
  var layerTree = $('app-catalog .themes-switcher');
  var themesSwitcher = $('app-themeswitcher #themes-content');
  var themeTab = $('#catalog');
  if (this['layersOpen']) {
    if (themesSwitcher.hasClass('in') && themeTab.hasClass('active')) {
      this['layersOpen'] = false;
    } else {
      this.showTab('a[href=\'#catalog\']');
      themesSwitcher.collapse('show');
      layerTree.collapse('hide');
    }
  } else {
    this['layersOpen'] = true;
    this.showTab('a[href=\'#catalog\']');
    themesSwitcher.collapse('show');
    layerTree.collapse('hide');
  }
};

/**
 * @export
 */
MainController.prototype.toggleTiles3dVisibility = function() {
  this.tiles3dVisible = !this.tiles3dVisible;
  this.ol3dm_.set3dTilesetVisible(this.tiles3dVisible);
  this.stateManager_.updateState({
    '3dtiles_visible': this.tiles3dVisible
  });
  if (this.tiles3dVisible) {
    var piwik = /** @type {Piwik} */ (this.window_['_paq']);
    piwik.push(['setDocumentTitle', '3dtiles_visible']);
    piwik.push(['trackPageView']);
  }
};

/**
 * Check if disconnected or offline mode enabled.
 * @return {boolean} the state.
 * @export
 */
MainController.prototype.isDisconnectedOrOffline = function() {
  return this.offlineMode.isEnabled() || !!this.networkStatus_.isDisconnected();
};

appModule.controller('MainController', MainController);


export default MainController;