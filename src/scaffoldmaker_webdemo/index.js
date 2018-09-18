var ToolTip = function() {
  var tooltipcontainerElement = undefined;
  var tipElement = undefined;
  var tiptextElement = undefined;
  var _this = this;
  
  /**
   * Show tool tip on the specified windows coordinates.
   * @param {Number} x - Style sheet with the same title.
   * @param {Number} y - selector string to match.
   */
  this.show = function(x, y) {
    tooltipcontainerElement.style.left = x +"px";
    tooltipcontainerElement.style.top = (y - 20) + "px";
    tipElement.style.visibility = "visible";
    tipElement.style.opacity = 1;
    tiptextElement.style.visibility = "visible";
    tiptextElement.style.opacity = 1;
  }
  
  this.hide = function() {
    tipElement.style.visibility = "hidden";
    tipElement.style.opacity = 0;
    tiptextElement.style.visibility = "hidden";
    tiptextElement.style.opacity = 0;
  }
  
  /**
   * Change the tooltip text.
   * @param {String} text - Text to update the tooltip to.
   */
  this.setText = function(text) {
    tiptextElement.innerHTML = text;
  }

  var setupToolTipContainer = function() {
    /*
    for (i = 0; i < childNodes.length; i++) {
      parent[0].appendChild(childNodes[i]);
    }
    */
    tooltipcontainerElement = document.getElementById("tooltipcontainer");
    tipElement = document.getElementById("tip");
    tiptextElement = document.getElementById("tiptext");
  }
  
  setupToolTipContainer();
}




var main = function() {
    var dat = require('dat.gui');
    var Zinc = require('zincjs');
    var THREE = Zinc.THREE;
    var toolTip = new ToolTip();
    console.log(toolTip)

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
    var csg = undefined;
    var scene = undefined;
    var zincRenderer = undefined;
    var acrossSeptumDisplay = undefined;
    var belowSeptumDisplay = undefined;
    var gui = undefined;
    var meshGuiControls = undefined;
    var meshPartsGui = undefined;
    var landmarks = [];
    var guiControls = new function() {
            this['Mesh Types'] = "3d_heartventriclesbase2";
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
    
    var _addOrganPartCallback = function() {
      return function(zincGeometry) {
        csg.addOrganPartCallback(zincGeometry);
        zincRenderer.viewAll();
      }
    }
    

    var confirmRemesh = function() {
            var currentScene = zincRenderer.getCurrentScene();
            currentScene.clearAll();
            csg.reset();
            for (i = 0; i < landmarks.length; i++) {
              scene.removeObject(landmarks[i]);
            }
            landmarks = [];
            var argumentString = "meshtype=" + guiControls['Mesh Types'];
            console.log(argumentString);
            for (var key in meshGuiControls){
                    argumentString = addItemToURL(argumentString, key);
            }
            var finalURL = "/generator?" + argumentString;
            currentScene.loadMetadataURL(finalURL, _addOrganPartCallback());
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
    
    var createMarker = function(location) {
      var geometry = new THREE.SphereGeometry(0.02, 16, 16);
      var material = new THREE.MeshBasicMaterial({
        color : 0x00ff00
      });
      var sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(location);
      scene.addObject(sphere);
      landmarks.push(sphere);
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
              if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                      var xi= JSON.parse(xmlhttp.responseText);
                      if (xi && xi.element && xi.xi) {
                        xiString = "Element " + xi.element + ", xi: " + xi.xi[0] + ", " + xi.xi[1] + ", " +xi.xi[2];
                        console.log(sphere)
                        sphere.name = xiString
                      }
              }     
      }
      var requestString = "./getXiCoordinates" + "?xi1=" + location.x + "&xi2=" + location.y + "&xi3=" + location.z;
      xmlhttp.open("GET", requestString, true);
      xmlhttp.send();
      
      return true;
    }


    var _pickingCallback = function() {
      return function(intersects, window_x, window_y) {
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.userData && (false == Array.isArray(intersects[i].object.userData))) {
            if (intersects[i].object.userData.groupName === "intersect") {
              console.log(intersects[i])
              return createMarker(intersects[i].point);
            }
          }
        }
      }
    };

    var _hoverCallback = function() {
      return function(intersects, window_x, window_y) {
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.name && intersects[i].object.name.includes("Element")) {
            console.log(intersects[i].object.name)
            toolTip.setText(intersects[i].object.name);
            toolTip.show(window_x, window_y);
            return;
          }
        }
        toolTip.hide();
      }
    }
    
    function initialise() {
            scene = undefined;
            zincRenderer = new Zinc.Renderer(container, window);
            Zinc.defaultMaterialColor = 0xFFFF9C
            zincRenderer.initialiseVisualisation();
            scene = zincRenderer.createScene("new");
            var zincCameraControl = scene.getZincCameraControls();
            zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
            zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
            zincRenderer.setCurrentScene(scene);
            zincRenderer.getThreeJSRenderer().localClippingEnabled = true;
            scene.loadViewURL("/static/view.json");
            zincRenderer.animate();
            csg = new (require('scaffoldmaker_webdemo/csg').csg)(scene, zincRenderer);
            var zincCameraControl = scene.getZincCameraControls();
            zincCameraControl.enableRaycaster(scene, _pickingCallback(), _hoverCallback());
            setupDatGuiPreprocess();
    }


    initialise();

};

window.document.addEventListener('DOMContentLoaded', main);
