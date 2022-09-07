from pyramid.view import view_config
from c2cgeoportal_commons.models import DBSession
from c2cgeoportal_commons.models.main import Theme as ThemeModel
from c2cgeoportal_geoportal.views.theme import Theme
from c2cgeoportal_geoportal.lib.caching import get_region, invalidate_region
from geoportailv3_geoportal.models import LuxLayerInternalWMS
import logging
import re
from c2cgeoportal_commons.models import main
from c2cgeoportal_geoportal.lib.wmstparsing import TimeInformation

log = logging.getLogger(__name__)
cache_region = get_region("std")
invalidate_region()


# override c2cgeoportal Entry class to customize handling of WMS and WMTS time positions and prepare
# the theme tree for ngeo time functions
class LuxThemes(Theme):
    async def _wms_getcap(self, ogc_server, preload=False):
        errors = set()
        if preload:
            return None, set()

        return {"layers": []}, set()

    def _layer(self, layer, time_=None, dim=None, mixed=True):
        errors: Set[str] = set()
        layer_info = {"id": layer.id, "name": layer.name, "metadata": super()._get_metadatas(layer, errors)}
        if re.search("[?#]", layer.name):  # pragma: no cover
            errors.add("The layer has an unsupported name '{}'.".format(layer.name))
        if isinstance(layer, main.LayerWMS) and re.search("[?#]", layer.layer):  # pragma: no cover
            errors.add("The layer has an unsupported layers '{}'.".format(layer.layer))
        if layer.geo_table:
            errors |= self._fill_editable(layer_info, layer)
        if mixed:
            assert time_ is None
            time_ = TimeInformation()
        assert time_ is not None

        errors |= dim.merge(layer, layer_info, mixed)

        if isinstance(layer, main.LayerWMS):
            wms, wms_errors = self._wms_layers(layer.ogc_server)
            errors |= wms_errors
            if wms is None:
                return None if errors else layer_info, errors
            if layer.layer is None or layer.layer == "":
                errors.add("The layer '{}' do not have any layers".format(layer.name))
                return None, errors
            layer_info["type"] = "WMS"
            layer_info["layers"] = layer.layer
            self._fill_wms(layer_info, layer, errors, mixed=mixed)
            errors |= self._merge_time(time_, layer_info, layer, wms)

        elif isinstance(layer, main.LayerWMTS):
            layer_info["type"] = "WMTS"
            self._fill_wmts(layer_info, layer, errors)

        elif isinstance(layer, main.LayerVectorTiles):
            layer_info["type"] = "VectorTiles"
            self._vectortiles_layers(layer_info, layer)

        return None if errors else layer_info, errors

    @view_config(route_name="themes", renderer="json")
    def themes(self):
        return super().themes()

    @view_config(route_name='isthemeprivate', renderer='json')
    def is_theme_private(self):
        theme = self.request.params.get('theme', '')

        cnt = DBSession.query(ThemeModel).filter(
            ThemeModel.public == False).filter(
            ThemeModel.name == theme).count()  # noqa

        if cnt == 1:
            return {'name': theme, 'is_private': True}

        return {'name': theme, 'is_private': False}

    def _wms_layers(self, ogc_server):
        if ogc_server.name == "Internal WMS":
            return self._wms_layers_internal()
        return super()._wms_layers(ogc_server)

    @cache_region.cache_on_arguments()
    def _wms_layers_internal(self):
        layers = {}
        for i, layer in enumerate(DBSession.query(LuxLayerInternalWMS)):
            for sublayer in layer.layers.split(","):
                layers[layer.name + '__' + sublayer] = {
                    "info": {
                        "name": layer.name + '__' + sublayer,
                    },
                    "children": []
                }

        return {"layers": layers}, set()

    def _fill_wms(self, layer_theme, layer, errors, mixed):
        if isinstance(layer, LuxLayerInternalWMS):
            layer_theme["imageType"] = layer.ogc_server.image_type
            if layer.style:  # pragma: no cover
                layer_theme["style"] = layer.style

            wms, wms_errors = self._wms_layers(layer.ogc_server)
            errors |= wms_errors
            if wms is None:
                return
            layer_theme["childLayers"] = []
            for layer_name in layer.layers.split(","):
                full_layer_name = layer.name + '__' + layer_name
                if full_layer_name in wms["layers"]:
                    wms_layer_obj = wms["layers"][full_layer_name]
                    if not wms_layer_obj["children"]:
                        layer_theme["childLayers"].append(wms["layers"][full_layer_name]["info"])
                    else:
                        for child_layer in wms_layer_obj["children"]:
                            layer_theme["childLayers"].append(wms["layers"][child_layer]["info"])
                else:
                    errors.add(
                        "The sublayer '{}' of internal layer {} is not defined in WMS capabilities".format(
                            layer_name, layer.name
                        )
                    )
        else:
            wms, wms_errors = self._wms_layers(layer.ogc_server)
            errors |= wms_errors
            if wms is None:
                return
            layer_theme["imageType"] = layer.ogc_server.image_type
            if layer.style:  # pragma: no cover
                layer_theme["style"] = layer.style

            layer_theme["childLayers"] = []
            if mixed:
                layer_theme["ogcServer"] = layer.ogc_server.name


    @view_config(route_name="lux_themes", renderer="json")
    def themes(self):
        return super().themes()


    @staticmethod
    def is_mixed(_):
        return True
