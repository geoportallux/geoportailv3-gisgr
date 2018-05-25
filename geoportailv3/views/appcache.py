from pyramid.view import view_config
from pyramid.response import Response
from pyramid.renderers import render
import logging

log = logging.getLogger(__name__)

@view_config(route_name='appcache', http_cache=0, renderer='../templates/geoportailv3.appcache')
def appcache(request):
    request.response.content_type = 'text/cache-manifest'
    return {}
