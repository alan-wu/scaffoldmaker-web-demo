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
    
    function getLandmarksJSON() {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var settings = JSON.parse(xmlhttp.responseText);
          var landmarksJson = {};
          landmarksJson.options = settings.options;
          landmarksJson.meshtype = settings.meshtype;
          landmarksJson.landmarks = [];
          for (var i = 0; i < landmarks.length; i++) {
            var landmarkJson = {};
            landmarkJson.name = landmarks[i].name;
            landmarkJson.xi = landmarks[i].userData.xi;
            landmarkJson.element = landmarks[i].userData.element;
            landmarksJson.landmarks.push(landmarkJson);
          }
          var jsonString = JSON.stringify(landmarksJson);
          console.log(landmarksJson);
          console.log(jsonString);
        }     
      }
      var requestString = "./getCurrentSettings";
      xmlhttp.open("GET", requestString, true);
      xmlhttp.send();
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
    
    var createMarker = function(location, labelIn) {
      var label = labelIn;
      if (label == null || label == "") {
        label = prompt("Please enter the annotation", "Landmark");
      }
      if (!(label == null || label == "")) {
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
                        var xi = JSON.parse(xmlhttp.responseText);
                        if (xi && xi.element && xi.xi) {
                          sphere.userData.xi = xi.xi;
                          sphere.userData.element = xi.element;
                          sphere.name = label;
                          //getLandmarksJSON();
                        }
                }     
        }
        var requestString = "./getXiCoordinates" + "?xi1=" + location.x + "&xi2=" + location.y + "&xi3=" + location.z;
        xmlhttp.open("GET", requestString, true);
        xmlhttp.send();
      }
      return true;
    }
    
    var addSphereFromLandmarksData = function(landmarksData) {
      var argumentString = "element=" + landmarksData.element;
      argumentString = argumentString + "&xi1="+landmarksData.xi[0] + "&xi2="+landmarksData.xi[1] +
        "&xi3="+landmarksData.xi[2];
      console.log(argumentString)
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var returnedObject = JSON.parse(xmlhttp.responseText);
          console.log(returnedObject)
          var coords = new THREE.Vector3( returnedObject["coordinates"][0], returnedObject["coordinates"][1],
              returnedObject["coordinates"][2] );
          createMarker(coords, landmarksData.name);
        }
      }
      xmlhttp.open("GET", "./getWorldCoordinates?" + argumentString, true);
      xmlhttp.send();
    } 
    
    
    var importDataDownloadedCompletedCallback = function(dataLandmarks) {
      return function() {
        if (dataLandmarks) {
            for (var i = 0; i < dataLandmarks.length; i++) {
              addSphereFromLandmarksData(dataLandmarks[i]);
            }
        }
      }
    }

    var confirmRemesh = function(itemDownloadCallback, allCompletedCallback) {
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
            currentScene.loadMetadataURL(finalURL, itemDownloadCallback, allCompletedCallback);
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
    
    var updateGuiOptions = function(options) {
      gui.removeFolder('Parameters');
      meshGuiControls = function() {
      };
      meshPartsGui = gui.addFolder('Parameters');
      meshPartsGui.open();
      modifyOptions(options);
      var confirmButton = { 'Confirm':function(){ confirmRemesh(_addOrganPartCallback()) }};
      meshPartsGui.add(confirmButton, 'Confirm');
    }

    var changeMeshTypesControl = function() {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var options = JSON.parse(xmlhttp.responseText);
          updateGuiOptions(options);
          confirmRemesh(_addOrganPartCallback());
        }     
      }
      var requestString = "./getMeshTypeOptions" + "?type=" + guiControls['Mesh Types'];
      xmlhttp.open("GET", requestString, true);
      xmlhttp.send();
    }
    
    //Data include meshtype, options and landmark
    var importData = function(data) {
      if (data && data.meshtype && data.options) {
        guiControls['Mesh Types'] = data.meshtype;
        updateGuiOptions(data.options);
        confirmRemesh(_addOrganPartCallback(), importDataDownloadedCompletedCallback(data.landmarks));
      } 
    }
    
    var read = function() {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var data = JSON.parse(xmlhttp.responseText);
          importData(data);
        }
      }
      xmlhttp.open("GET", "/static/testFile.json", true);
      xmlhttp.send();
    }
    
    var write = function() {
      getLandmarksJSON();
    }
    

    var setupDatGui = function(meshTypes) {
            gui = new dat.GUI({autoPlace: false, width: 350});
            gui.domElement.id = 'gui';
            gui.close();
            createMeshTypesChooser(meshTypes);
            var customContainer = document.getElementById("meshGui").append(gui.domElement);
            var viewAllButton = { 'View All':function(){ viewAll() }};
            var resetButton = { 'Reset':function(){ resetView() }};
            var readButton = { 'Read':function(){ read() }};
            var writeButton = { 'Write':function(){ write() }};
            gui.add(viewAllButton, 'View All');
            gui.add(resetButton, 'Reset');
            gui.add(readButton, 'Read');
            gui.add(writeButton, 'Write');
            changeMeshTypesControl();
    }
        
    var _pickingCallback = function() {
      return function(intersects, window_x, window_y) {
        for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].object.userData && (false == Array.isArray(intersects[i].object.userData))) {
            if (intersects[i].object.userData.groupName === "intersect") {
              console.log(intersects[i])
              return createMarker(intersects[i].point, null);
            }
          }
        }
      }
    };

    var _hoverCallback = function() {
      return function(intersects, window_x, window_y) {
        for (var i = 0; i < intersects.length; i++) {
          var currentObject = intersects[i].object;
          //if (intersects[i].object.name && intersects[i].object.name.includes("Element")) {
          if (currentObject.name && currentObject.userData.xi && currentObject.userData.element) {
            var displayString = currentObject.name + "<br />{ Element " + 
              currentObject.userData.element + ", xi: " + currentObject.userData.xi[0] + ", " + 
              currentObject.userData.xi[1] + ", " + currentObject.userData.xi[2]+"}";
            toolTip.setText(displayString);
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
