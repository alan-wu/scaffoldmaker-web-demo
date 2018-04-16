"""
Generates 3-D Left and Right ventricles mesh starting from modified sphere shell mesh.
"""
import os
import math
import string
import random
from scaffoldmaker.scaffoldmaker import Scaffoldmaker
from scaffoldmaker.meshtypes.meshtype_2d_plate1 import MeshType_2d_plate1
from scaffoldmaker.meshtypes.meshtype_2d_plate1 import MeshType_2d_plate1
from scaffoldmaker.meshtypes.meshtype_2d_platehole1 import MeshType_2d_platehole1
from scaffoldmaker.meshtypes.meshtype_2d_sphere1 import MeshType_2d_sphere1
from scaffoldmaker.meshtypes.meshtype_2d_tube1 import MeshType_2d_tube1
from scaffoldmaker.meshtypes.meshtype_3d_box1 import MeshType_3d_box1
from scaffoldmaker.meshtypes.meshtype_3d_boxhole1 import MeshType_3d_boxhole1
from scaffoldmaker.meshtypes.meshtype_3d_heartatria1 import MeshType_3d_heartatria1
from scaffoldmaker.meshtypes.meshtype_3d_heartventricles1 import MeshType_3d_heartventricles1
from scaffoldmaker.meshtypes.meshtype_3d_heartventricles2 import MeshType_3d_heartventricles2
from scaffoldmaker.meshtypes.meshtype_3d_heartventriclesbase1 import MeshType_3d_heartventriclesbase1
from scaffoldmaker.meshtypes.meshtype_3d_sphereshell1 import MeshType_3d_sphereshell1
from scaffoldmaker.meshtypes.meshtype_3d_sphereshellseptum1 import MeshType_3d_sphereshellseptum1
from scaffoldmaker.meshtypes.meshtype_3d_tube1 import MeshType_3d_tube1
from scaffoldmaker.meshtypes.meshtype_3d_tubeseptum1 import MeshType_3d_tubeseptum1
from opencmiss.zinc.context import Context
from opencmiss.zinc.fieldmodule import Fieldmodule
from opencmiss.zinc.glyph import Glyph
from opencmiss.zinc.graphics import Graphics
from opencmiss.zinc.material import Material
import json

meshes = {
    k: v for k, v in globals().items() if k.startswith('MeshType_')
}


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
    lineAttr.setBaseSize([0.007, 0.007])
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

    # Get the total number of graphics in a scene/region that can be exported
    number = sceneSR.getNumberOfResourcesRequired()
    resources = []
    # Write out each graphics into a json file which can be rendered with our
    # WebGL script
    for i in range(number):
        resources.append(sceneSR.createStreamresourceMemory())
    scene.write(sceneSR)
    # Write out each resource into their own file

    return [resources[i].getBuffer()[1] for i in range(number)]


def mergeOptions(options1, options2):
    for item in options2:
        options1[item] = options2[item]
    return options1


def meshGeneration(typeName, region, options):
    typeString = 'MeshType_' + typeName
    typeClass = meshes.get(typeString)
    fieldmodule = region.getFieldmodule()
    fieldmodule.beginChange()
    myOptions = mergeOptions(typeClass.getDefaultOptions(), options)
    typeClass.generateMesh(region, myOptions)
    fieldmodule.defineAllFaces()
    fieldmodule.endChange()


def outputModel(meshtype, options):
    prefix = "temp"
    # Initialise a sceneviewer for viewing
    context = Context('output')
    logger = context.getLogger()
    context.getGlyphmodule().defineStandardGlyphs()
    region = context.createRegion()

    #readTestRegion(region)
    meshGeneration(meshtype, region, options)
    # Create surface graphics which will be viewed and exported
    createSurfaceGraphics(context, region)
    createCylindeLineGraphics(context, region)
    # Export graphics into JSON format

    return exportWebGLJson(region, prefix)


def getMeshTypesString():
    scaffoldmaker = Scaffoldmaker()
    meshTypes = scaffoldmaker.getMeshTypes()
    meshStrings = []
    for type in meshTypes:
        meshStrings.append(type.__name__.replace('MeshType_', ''))
    return meshStrings


def getMeshTypeOptions(typeName):
    typeString = 'MeshType_' + typeName
    typeClass = meshes.get(typeString)
    defaultOptions = typeClass.getDefaultOptions()
    availableOptions = typeClass.getOrderedOptionNames()
    configurationOptions={}
    for option in availableOptions:
        configurationOptions[option] = defaultOptions[option]

    return configurationOptions
