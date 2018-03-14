"""
Generates 3-D Left and Right ventricles mesh starting from modified sphere shell mesh.
"""
import os 
import math
import string
import random
from scaffoldmaker.meshtypes.meshtype_3d_heartventriclesbase1 import MeshType_3d_heartventriclesbase1
from opencmiss.zinc.context import Context
from opencmiss.zinc.fieldmodule import Fieldmodule
from opencmiss.zinc.glyph import Glyph
from opencmiss.zinc.graphics import Graphics
from opencmiss.zinc.material import Material
import os 
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
    lineAttr.setBaseSize([0.015, 0.015])
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
	
def exportWebGLJson(region, location, prefix):
    '''
    Export graphics into JSON format, one json export represents one
    surface graphics.
    '''
    directory = "../../mytesting/mesher_output/html/generated/" + location + "/"
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
    metaBuffer = ""
    '''create directory if it does not exist'''
    if not os.path.exists(directory):
    	os.makedirs(directory)
    	
    for i in range(number):
        f = None
        file_name = None
        if i == 0:
            file_name = directory + prefix + '_' + 'metadata.json'
        else:
            file_name = directory + prefix + '_' + str(i) + '.json'
        f = open(file_name, 'w+')
        buffer = resources[i].getBuffer()[1]
        if i == 0:
            for j in range(number-1):
                replaceName = 'html/generated/' + location + "/" + prefix + '_' + str(j+1) + '.json'
                old_name = 'memory_resource'+ '_' + str(j+2)
                buffer = buffer.replace(old_name, replaceName)
            metaBuffer = buffer
        f.write(buffer)
        f.close()
        
    return metaBuffer
	
def mergeOptions(options1, options2):
	for item in options2:
		options1[item] = options2[item]
	return options1

def meshGeneration(region, options):
	fieldmodule = region.getFieldmodule()
	fieldmodule.beginChange()
	myOptions = mergeOptions(MeshType_3d_heartventriclesbase1.getDefaultOptions(), options)
	MeshType_3d_heartventriclesbase1.generateMesh(region, myOptions)
	fieldmodule.defineAllFaces()
	fieldmodule.endChange()
	
def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))

def outputModel(options):
	location = id_generator()
	prefix = "temp"
	'''Initialise a sceneviewer for viewing'''
	context = Context('output')
	logger = context.getLogger()
	context.getGlyphmodule().defineStandardGlyphs()
	region = context.createRegion()
	
	#readTestRegion(region)
	meshGeneration(region, options)
	'''Create surface graphics which will be viewed and exported'''
	createSurfaceGraphics(context, region)
	createCylindeLineGraphics(context, region)
	'''Export graphics into JSON format'''
	
	return exportWebGLJson(region, location, prefix)
	

