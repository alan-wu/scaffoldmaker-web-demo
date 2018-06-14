"""
Generates 3-D Left and Right ventricles mesh starting from modified sphere shell mesh.
"""

import os
import json
import math
import collections
from scaffoldmaker.scaffoldmaker import Scaffoldmaker
from opencmiss.zinc.context import Context
from opencmiss.zinc.material import Material

meshes = {
    meshtype.__name__[len('MeshType_'):]: meshtype
    for meshtype in Scaffoldmaker().getMeshTypes()
}


def createCylindeLineGraphics(context, region):
    '''create cylinders which outline the shapes of the heart'''
    scene = region.getScene()
    field_module = region.getFieldmodule()
    material_module = context.getMaterialmodule()
    material = material_module.findMaterialByName('silver')

    tm = context.getTessellationmodule()
    tessellation = tm.getDefaultTessellation()
    tessellation.setCircleDivisions(8)

    scene.beginChange()
    lines = scene.createGraphicsLines()
    finite_element_field = field_module.findFieldByName('coordinates')
    lines.setCoordinateField(finite_element_field)
    lineAttr = lines.getGraphicslineattributes()
    lineAttr.setShapeType(lineAttr.SHAPE_TYPE_CIRCLE_EXTRUSION)
    lineAttr.setBaseSize([0.007, 0.007])
    lines.setMaterial(material)
    lines.setExterior(True)
     # Let the scene render the scene.
    scene.endChange()


def createSurfaceGraphics(context, region):
    material_module = context.getMaterialmodule()
    scene = region.getScene()
    scene.beginChange()
    fieldmodule = region.getFieldmodule()
    material_module.defineStandardMaterials()
    material = material_module.findMaterialByName('muscle')
    material.setAttributeReal3(Material.ATTRIBUTE_DIFFUSE, [0.7, 0.12, 0.1])
    material.setAttributeReal3(Material.ATTRIBUTE_AMBIENT, [0.7, 0.14, 0.11])
    finite_element_field = fieldmodule.findFieldByName('coordinates')
    surface = scene.createGraphicsSurfaces()
    surface.setCoordinateField(finite_element_field)
    surface.setMaterial(material)
    surface.setExterior(True)
    scene.endChange()


def exportWebGLJson(region):
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


def finalizeOptions(meshtype_cls, provided_options):
    options = {}
    default_options = meshtype_cls.getDefaultOptions()
    for key, default_value in default_options.items():
        provided_value = provided_options.get(key)
        if type(default_value) != type(provided_value):
            # TODO figure out how to propagate type mistmatch issue to
            # response.
            options[key] = default_value
        else:
            options[key] = provided_value
    return options


def meshGeneration(meshtype_cls, region, options):
    fieldmodule = region.getFieldmodule()
    fieldmodule.beginChange()
    myOptions = finalizeOptions(meshtype_cls, options)
    meshtype_cls.generateMesh(region, myOptions)
    fieldmodule.defineAllFaces()
    fieldmodule.endChange()


def outputModel(meshtype, options):
    """
    Provided meshtype must exist as a key in the meshes dict in this
    module.
    """

    # Initialise a sceneviewer for viewing
    meshtype_cls = meshes.get(meshtype)
    context = Context('output')
    logger = context.getLogger()
    context.getGlyphmodule().defineStandardGlyphs()
    region = context.createRegion()
    #readTestRegion(region)
    meshGeneration(meshtype_cls, region, options)
    # Create surface graphics which will be viewed and exported
    createSurfaceGraphics(context, region)
    createCylindeLineGraphics(context, region)
    # Export graphics into JSON format
    return exportWebGLJson(region)


def getMeshTypeOptions(meshtype):
    """
    Provided meshtype must exist as a key in the meshes dict in this
    module, otherwise return value will be None.
    """

    meshtype_cls = meshes.get(meshtype)
    if not meshtype_cls:
        return None
    defaultOptions = meshtype_cls.getDefaultOptions()
    orderedNames = meshtype_cls.getOrderedOptionNames()
    orderedOptions=collections.OrderedDict()
    for option in orderedNames:
        orderedOptions.update({option:defaultOptions[option]})
    return orderedOptions
