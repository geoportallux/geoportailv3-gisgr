import os
import glob
import time

UNUSED = '/static-ngeo/'
BUILD_PATH = '/etc/static-ngeo/'


def get_built_filenames(pattern):
    return [os.path.basename(name) for name in glob.glob(
        os.path.join(BUILD_PATH, pattern)
    )]


def get_urls(request):
    urls = [
        '/',
        '/dynamic.json?interface=main',
        '/getuserinfo',
        '/themes?version=2&background=background&interface=main&catalogue=true&min_levels=1',
        request.static_path('geoportailv3_geoportal:static-ngeo/images/arrow.png'),
    ]
    for elem in ['main*.js', 'main*.css', 'gov-light*.png']:
        url = get_built_filenames(elem)
        if len(url) > 0:
            urls.append(UNUSED + url[0])

    if 'dev' in request.params:
        urls.append('/dev/main.html')
        urls.append('/dev/main.css')
        urls.append('/dev/main.js')

    woffs = glob.glob('/etc/static-ngeo/*.woff')
    for stuff in get_built_filenames('*.woff'):
        urls.append(UNUSED + stuff)

    return urls
