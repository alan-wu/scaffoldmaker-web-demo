var main = function() {
    var dat = require('dat.gui');
    var Renderer = require('scaffoldmaker_webdemo/renderer').Renderer;
    var Zinc = require('scaffoldmaker_webdemo/zinc').Zinc;

    // https://stackoverflow.com/questions/18085540/remove-folder-in-dat-gui
    dat.GUI.prototype.removeFolder = function(name) {
        var folder = this.__folders[name];
        if (!folder) {
            return;
        }
        folder.close();
        this.__ul.removeChild(folder.domElement.parentNode);
        delete this.__folders[name];
        this.onResize();
    }

    var currentModel = undefined;

    var container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.style.height = "100%"
    var scene = undefined;
    var zincRenderer = undefined;
    var acrossSeptumDisplay = undefined;
    var belowSeptumDisplay = undefined;
    var gui = undefined;
    var meshGuiControls = undefined;
    var meshPartsGui = undefined;
    var guiControls = new function() {
            this['Mesh Types'] = "3d_heartventriclesbase1";
    };
                            
    var removeGeoemtry = function(scene) {
            return function(zincGeometry) {
                    scene.removeZincGeometry(zincGeometry);
            }
    }

    var removeGlyphset = function(scene) {
            return function(zincGlyphset) {
                    scene.removeZincGlyphset(zincGlyphset);
            }
    }

    function resetView()
    {
            zincRenderer.resetView();
            changeMeshTypesControl();
    }

    function viewAll()
    {
            zincRenderer.viewAll();
    }

    var addItemToURL = function(originalString, paramName) {
            var compatibleParamName = encodeURIComponent(paramName);
            var parametersValue = meshGuiControls[paramName];
            var newString = "";
            if (originalString == "")
                    newString = compatibleParamName + "=" + parametersValue;
            else
                    newString = originalString + "&" + compatibleParamName + "=" + parametersValue;
            return newString;
    }

    var confirmRemesh = function() {
            var currentScene = zincRenderer.getCurrentScene();
            currentScene.clearAll()
            var argumentString = "meshtype=" + guiControls['Mesh Types'];
            console.log(argumentString);
            for (var key in meshGuiControls){
                    argumentString = addItemToURL(argumentString, key);
            }
            var finalURL = "/generator?" + argumentString;
            console.log(finalURL);
            zincRenderer.getCurrentScene().loadMetadataURL(finalURL);
    }

    var setupDatGuiPreprocess = function() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var meshTypes = JSON.parse(xmlhttp.responseText);
                            setupDatGui(meshTypes);
            }
            }
            xmlhttp.open("GET", "./getMeshTypes", true);
            xmlhttp.send();
    }

    var createMeshTypesChooser = function(meshTypes) {
            gui.add(guiControls, 'Mesh Types', meshTypes ).onChange(function(value) {
                    changeMeshTypesControl();
            });;
    }

    var addOption = function(key, value) {
            meshPartsGui.add(meshGuiControls, key);
    }

    var modifyOptions = function(options) {
            for (var key in options) {
                // check if the property/key is defined in the object itself, not in parent
                if (options.hasOwnProperty(key)) {
                   meshGuiControls[key] = options[key];
                   addOption(key, options[key]);
                }
            }
    }

    var changeMeshTypesControl = function() {
            gui.removeFolder('Parameters');
            meshGuiControls = function() {
            };
            meshPartsGui = gui.addFolder('Parameters');
            meshPartsGui.open();
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var options = JSON.parse(xmlhttp.responseText);
                            modifyOptions(options);
                            var confirmButton = { 'Confirm':function(){ confirmRemesh() }};
                            meshPartsGui.add(confirmButton, 'Confirm');
                            confirmRemesh();
            }
            }
            var requestString = "./getMeshTypeOptions" + "?type=" + guiControls['Mesh Types'];
            xmlhttp.open("GET", requestString, true);
            xmlhttp.send();

    }

    var setupDatGui = function(meshTypes) {
            gui = new dat.GUI({autoPlace: false, width: 350});
            gui.domElement.id = 'gui';
            gui.close();
            createMeshTypesChooser(meshTypes);
            var customContainer = document.getElementById("meshGui").append(gui.domElement);
            var viewAllButton = { 'View All':function(){ viewAll() }};
            var resetButton = { 'Reset':function(){ resetView() }};
            gui.add(viewAllButton, 'View All');
            gui.add(resetButton, 'Reset');
            changeMeshTypesControl();
    }

    function initialise() {
            scene = undefined;
            zincRenderer = new Renderer(container, window);
            Zinc.defaultMaterialColor = 0xFFFF9C
            zincRenderer.initialiseVisualisation();
            scene = zincRenderer.createScene("new");
            var zincCameraControl = scene.getZincCameraControls();
            zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
            zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
            zincRenderer.setCurrentScene(scene);
            scene.loadViewURL("/static/view.json");
            zincRenderer.animate();
            setupDatGuiPreprocess();
    }


    initialise();

};

window.document.addEventListener('DOMContentLoaded', main);
