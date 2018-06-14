import logging
from json import loads, dumps
from time import time
from os.path import dirname
from os.path import join
from pkg_resources import get_distribution
from sanic import Sanic
from sanic.response import json, html, text
from scaffoldmaker_webdemo import mesheroutput
from scaffoldmaker_webdemo import backend

db_src = 'sqlite://'
app = Sanic()

with open(join(dirname(__file__), 'static', 'index.html')) as fd:
    index_html = fd.read()
    
with open(join(dirname(__file__), 'static', 'view.json')) as vd:
    view_json = loads(vd.read())

bundle_js = get_distribution('scaffoldmaker_webdemo').get_metadata(
    'calmjs_artifacts/bundle.js')
bundle_css = get_distribution('scaffoldmaker_webdemo').get_metadata(
    'calmjs_artifacts/bundle.min.css')

store = backend.Store(db_src)
logger = logging.getLogger(__name__)


def build(typeName, options):
    model = mesheroutput.outputModel(typeName, options)
    job = backend.Job()
    job.timestamp = int(time())
    for data in model:
        resource = backend.Resource()
        resource.data = data
        job.resources.append(resource)
    response = loads(job.resources[0].data)
    store.add(job)
    for idx, obj in enumerate(response, 1):
        resource_id = job.resources[idx].id
        obj['URL'] = '/output/%d' % resource_id
    return response


@app.route('/output/<resource_id:int>')
async def output(request, resource_id):
    return json(store.query_resource(resource_id))


@app.route('/generator')
async def generator(request):
    options = {}
    typeName = '3d_heartventricles1'
    for k, values in request.args.items():
        v = values[0]
        if k == 'meshtype':
            typeName = v
        elif k == 'Use cross derivatives':
            options[k] = v == 'true'
        elif v.isdecimal():
            options[k] = int(v)
        elif v.replace('.', '', 1).isdecimal():
            options[k] = float(v)
        elif v == 'false':
            options[k] = False
        elif v == 'true':
            options[k] = True

    if typeName not in mesheroutput.meshes.keys():
        return json({'error': 'no such mesh type'}, status=400)

    try:
        response = build(typeName, options)
    except Exception as e:
        logger.exception('error while generating mesh')
        return json({'error': 'error generating mesh: ' + str(e)}, status=400)

    return json(response)


@app.route('/getMeshTypes')
async def getMeshTypes(request):
    return json(sorted(mesheroutput.meshes.keys()))


@app.route('/getMeshTypeOptions')
async def getMeshTypeOptions(request):
    options = mesheroutput.getMeshTypeOptions(request.args.get('type'))
    if options is None:
        return json({'error': 'no such mesh type'}, status=400)
    return json(options, dumps=dumps)


@app.route('/scaffoldmaker_webdemo.js')
async def serve_js(request):
    return text(bundle_js, headers={'Content-Type': 'application/javascript'})


@app.route('/scaffoldmaker_webdemo.css')
async def serve_css(request):
    return text(bundle_css, headers={'Content-Type': 'text/css'})

@app.route('/static/view.json')
async def view(request):
    return json(view_json)

@app.route('/')
async def root(request):
    return html(index_html)


def main():
    app.run(host='0.0.0.0', port=8000)


if __name__ == '__main__':
    main()
