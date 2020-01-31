/**
 * @module app.OfflineRestorer
 */
import appModule from './module.js';
import Restorer from 'ngeo/offline/Restorer.js';

/**
 * @extends {Restorer}
 */
const OfflineRestorer = class extends Restorer {
  /**
   * @ngInject
   * @param {ngeo.offline.Configuration} ngeoOfflineConfiguration A service for customizing offline behaviour.
   * @param {ngeo.map.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer manager.
   * @param {app.MymapsOffline} appMymapsOffline mymaps offline service.
   * @param {app.draw.DrawnFeatures} appDrawnFeatures Drawn features service.
   */
  constructor(ngeoOfflineConfiguration, ngeoBackgroundLayerMgr,
              appMymapsOffline, appDrawnFeatures) {
    super(ngeoOfflineConfiguration, ngeoBackgroundLayerMgr);
    /**
     * @type {app.MymapsOffline}
     * @private
     */
    this.appMymapsOffline_ = appMymapsOffline;

    /**
     * @private
     * @type {app.draw.DrawnFeatures}
     */
    this.appDrawnFeatures_ = appDrawnFeatures;

    /**
     * @type {boolean}
     */
    this.restoring = false;
  }

  /**
   * @param {ol.Map} map The map to work on.
   * @return {Promise<ol.Extent>} A promise resolving when restore is finished.
   * @override
   */
  restore(map) {
    this.restoring = true;
    return super.restore(map).then((extent) => {
      this.appMymapsOffline_.restore();
      map.addLayer(this.appDrawnFeatures_.drawLayer);
      this.restoring = false;
      return extent;
    });
  }

  /**
   * @param {ol.Map} map The map.
   * @param {ngeox.OfflinePersistentContent} offlineContent The offline content.
   * @return {ol.Extent} the extent.
   * @override
   */
  doRestore(map, offlineContent) {
    const view = map.getView();
    const {zooms} = offlineContent;
    view.setMinZoom(zooms[0]);
    view.setMaxZoom(zooms[zooms.length - 1 ]);
    return super.doRestore(map, offlineContent);
  }

};

appModule.service('appOfflineRestorer', OfflineRestorer);
const exports = OfflineRestorer;


export default exports;
