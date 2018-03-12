"""
Generates 3-D Left and Right ventricles mesh starting from modified sphere shell mesh.
"""

import math
from zincmesher.meshtypes.meshtype_3d_heartventricles1 import MeshType_3d_heartventricles1
from opencmiss.zinc.context import Context
from opencmiss.zinc.fieldmodule import Fieldmodule
from opencmiss.zinc.glyph import Glyph
from opencmiss.zinc.graphics import Graphics
from opencmiss.zinc.material import Material
import json

    
def createCylindeLineGraphics(context, region):
    '''create cylinders which outline the shapes of the heart'''
    scene = region.getScene()
    field_module = region.getFieldmodule()
    material_module = context.getMaterialmodule()
    material = material_module.findMaterialByName('copper')
    
    tm = context.getTessellationmodule()
    tessellation = tm.createTessellation()
    tessellation.setCircleDivisions(1)
    tessellation.setRefinementFactors([4])
    
    scene.beginChange()
    lines = scene.createGraphicsLines()
    finite_element_field = field_module.findFieldByName('coordinates')
    lines.setCoordinateField(finite_element_field)
    lines.setTessellation(tessellation)
    
    lineAttr = lines.getGraphicslineattributes()
    lineAttr.setShapeType(lineAttr.SHAPE_TYPE_CIRCLE_EXTRUSION)
    lineAttr.setBaseSize([0.01, 0.01])
    lines.setMaterial(material)
     # Let the scene render the scene.
    scene.endChange()

def createSurfaceGraphics(context, region):
	material_module = context.getMaterialmodule()
	scene = region.getScene()
	scene.beginChange()
	fieldmodule = region.getFieldmodule()
	tm = context.getTessellationmodule()
	tessellation = tm.createTessellation()
	tessellation.setMinimumDivisions([4,4,1])
	material_module.defineStandardMaterials()
	material = material_module.findMaterialByName('muscle')

	finite_element_field = fieldmodule.findFieldByName('coordinates')
	surface = scene.createGraphicsSurfaces()
	surface.setCoordinateField(finite_element_field)
	surface.setTessellation(tessellation)
	surface.setMaterial(material)
	scene.endChange()
	
def exportWebGLJson(region, prefix):
    '''
    Export graphics into JSON format, one json export represents one
    surface graphics.
    '''
    scene = region.getScene()
    sceneSR = scene.createStreaminformationScene()
    sceneSR.setIOFormat(sceneSR.IO_FORMAT_THREEJS)

    ''' Get the total number of graphics in a scene/region that can be exported'''
    number = sceneSR.getNumberOfResourcesRequired()
    resources = []
    '''Write out each graphics into a json file which can be rendered with our WebGL script'''
    for i in range(number):
        resources.append(sceneSR.createStreamresourceMemory())
    scene.write(sceneSR)
    '''Write out each resource into their own file'''
    for i in range(number):
        f = None
        if i == 0:
            f = open('html/' + prefix + '_' + 'metadata.json', 'w+')
        else:
            f = open('html/' + prefix + '_' + str(i) + '.json', 'w+')
        buffer = resources[i].getBuffer()[1]
        if i == 0:
            for j in range(number-1):
                replaceName = '' + prefix + '_' + str(j+1) + '.json'
                old_name = 'memory_resource'+ '_' + str(j+2)
                buffer = buffer.replace(old_name, replaceName)
        f.write(buffer)
        f.close()

def readTestRegion(region):
	region.readFile("input/cube.exnode");
	region.readFile("input/cube.exelem");
	
def meshGeneration(region):
	fieldmodule = region.getFieldmodule()
	fieldmodule.beginChange()
	options = MeshType_3d_heartventricles1.getDefaultOptions()
	MeshType_3d_heartventricles1.generateMesh(region, options)
	fieldmodule.defineAllFaces()
	fieldmodule.endChange()

def outputModel():
	prefix = "test"
	'''Initialise a sceneviewer for viewing'''
	context = Context('output')
	logger = context.getLogger()
	context.getGlyphmodule().defineStandardGlyphs()
	region = context.createRegion()
	
	#readTestRegion(region)
	meshGeneration(region)
	'''Create surface graphics which will be viewed and exported'''
	createSurfaceGraphics(context, region)
	createCylindeLineGraphics(context, region)
	'''Export graphics into JSON format'''
	exportWebGLJson(region, prefix)
	numOfMessages = logger.getNumberOfMessages()
	for i in range(1, numOfMessages+1):
	    print logger.getMessageTextAtIndex(i)
    
outputModel()
