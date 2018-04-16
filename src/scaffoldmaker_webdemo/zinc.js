/**
 * Provides a global namespace for the Zinc javascript library and some default parameters for it.
 * 
 * @namespace
 * @author Alan Wu
 */
var Zinc = { REVISION: '28' };

Zinc.defaultMaterialColor = 0x7F1F1A;
Zinc.defaultOpacity = 1.0;

exports.Zinc = Zinc;

Zinc.Controls = require('scaffoldmaker_webdemo/controls').Controls;
Zinc.Geometry = require('scaffoldmaker_webdemo/geometry').Geometry;
Zinc.Glyph = require('scaffoldmaker_webdemo/glyph').Glyph;
Zinc.Glyphset = require('scaffoldmaker_webdemo/glyphset').Glyphset;
Zinc.Renderer = require('scaffoldmaker_webdemo/renderer').Renderer;
Zinc.Scene = require('scaffoldmaker_webdemo/scene').Scene;
Zinc.Utilities = require('scaffoldmaker_webdemo/utilities').Utilities;
