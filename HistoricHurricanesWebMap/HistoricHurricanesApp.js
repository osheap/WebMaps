// Patrick O'Shea Assignment 8: Mapping Hurricanes App Improved.

// Requires and call backs. 
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleLineSymbol",
    "esri/widgets/Legend",
    "esri/widgets/Slider",
    "esri/Graphic",
    "esri/rest/support/Query",
    "esri/widgets/ScaleBar"
  ], (Map, MapView, FeatureLayer,ClassBreaksRenderer,SimpleLineSymbol,Legend,Slider,Graphic,Query,ScaleBar) => {
  
  // Define initial empty variables and array
  let Hurricanes,legend;
  let graphics = [];
    
  // Creates map with dark-grey basemap 
    const map = new Map({
      basemap: "dark-gray-vector",
    });
  
  // Creates map view
    const view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 2,
      center: [-52, 22]
    });
  
  // Add a scale bar
  const sBar = new ScaleBar({
      view: view,
      style: "ruler",
      unit: "imperial"
    });
  view.ui.add(sBar, {
     position: "top-left"
   });
  
  
  //Create a new render based on Hurricane windspeed
    const hurricaneRender = new ClassBreaksRenderer({
      field: "USA_WIND"
    });
    
  // Add Class Breaks to my render using colorbrewer (7-class YlOrRd Multi-hue) for
  // each hurricane category as well as tropical storms/depressions.
    
    hurricaneRender.addClassBreakInfo({
      minValue: 0,
      maxValue: 63,
      symbol: new SimpleLineSymbol({
        color: "#fed976",
        style: "dot",
        width: 2
          }),
      label: "0 - 63 (Tropical Storm/Tropical Depression)"
        });
    hurricaneRender.addClassBreakInfo({
      minValue: 64,
      maxValue: 82,
      symbol: new SimpleLineSymbol({
        color: "#feb24c",
        style: "dot",
        width: 2
          }),
      label: "64 - 82 (Category 1)"
        });
    hurricaneRender.addClassBreakInfo({
      minValue: 83,
      maxValue: 95,
      symbol: new SimpleLineSymbol({
        color: "#fd8d3c",
        style: "dot",
        width: 2
          }),
      label: "83 - 95 (Category 2)"
        });
    hurricaneRender.addClassBreakInfo({
      minValue: 96,
      maxValue: 112,
      symbol: new SimpleLineSymbol({
        color: "#fc4e2a",
        style: "dot",
        width: 2
          }),
      label: "96 - 112 (Category 3)"
        });
    hurricaneRender.addClassBreakInfo({
      minValue: 113,
      maxValue: 136,
      symbol: new SimpleLineSymbol({
        color: "#e31a1c",
        style: "dot",
        width: 2
          }),
      label: "113 - 136 (Category 4)"
        });
    hurricaneRender.addClassBreakInfo({
      minValue: 137,
      maxValue: 300,
      symbol: new SimpleLineSymbol({
        color: "#b10026",
        style: "dot",
        width: 2
          }),
      label: "137+ (Category 5)"
        }); 
    
    // Create a pop-up template that displays the storm name, the year, and the max windspeed
    
    const popupTemp = {
        title: "HURRICANE {NAME}",
        content: "Year: {year}<br />Maximum Sustained Wind (knots): {USA_WIND}",
    fieldInfos: [{
          fieldName: "year",
          format: { 
            places: 0 
          }
        },
        {
          fieldName: "USA_WIND",
          format: {
            places: 0   
          }
        }]
      };
  
   // Create the hurricane slider and add it to the ui 
   const hurricaneSlider = new Slider({
      container: "year",
      min: 1842,
      max: 2023,
      steps: 1,
      values: [1995],
      visibleElements: {
        labels: true,
        rangeLabels: true
      }
    });
    
  view.ui.add("infoDiv", {
  position: "top-right"
  });
  
    
  // Establish initial conditions to populate map
  let hurricaneYear = 1995;
  createHurricanes();
    
  // Define function for visualizing hurricanes by year, this will get called every time
  // the slider is manipulated, either by dragging the slider or clicking the slider and
  // using the arrow keys. 
    
  function createHurricanes(){
    map.removeAll();
      // define hurricane feature layer
      const Hurricanes = new FeatureLayer({  
        url:"https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/IBTrACS_ALL_list_v04r00_lines_1/FeatureServer",
        renderer:hurricaneRender,
        definitionExpression: "year = " + hurricaneYear,
        outFields:["NAME","OBJECTID"],
        orderByFields:["NAME"],
        popupTemplate:popupTemp
      });
       map.add(Hurricanes);
  // Call create legend function to generate the legend every time the createHurricanes function is called
       createLegend(Hurricanes);
  // Call the displayResults function to populate the sidebar every time the createHurricanes function is called
       displayResults(Hurricanes);
       return Hurricanes;
    };
   
    //create legend function
   function createLegend(Hurricanes){ 
    const legend = new Legend({
      view: view,
      layerInfos: [
      {
        layer: Hurricanes,
        title: "Hurricane Categories Based On Windspeed"
      }]
    });
    view.ui.empty("bottom-left");
    view.ui.add(legend, "bottom-left");
   };
  
  
  // establish on drag functionality to call createHurricanes function 
  hurricaneSlider.on("thumb-drag", function(event) {
    if (event.state === "stop"){
    hurricaneYear = event.value;
    createHurricanes(hurricaneYear);
      }
    });
  
  // establish on change (using the arrows to change year),
  // functionality to call createHurricanes function 
  hurricaneSlider.on("thumb-change", function(event) {
    hurricaneYear = event.value;
    createHurricanes(hurricaneYear);
    });
  
  
  
  // Display results function that populates the sidebar
    
  function displayResults(featureLayer) {
  // Clear graphics array
    graphics = [];
    
  //Define listNode and fragment
    const listNode = document.getElementById("hurricanesInYear"); 
    const fragment = document.createDocumentFragment();
  
  // establish query and loop through features
    featureLayer.queryFeatures().then(function (results) {
      results.features.forEach(function (hurricane, index) {
        const attributes = hurricane.attributes;
        const name = attributes.NAME;
  
        // Create a list item element
        const li = document.createElement("li");
        li.classList.add("panel-result");
        li.tabIndex = 0;
        li.setAttribute("data-result-id", index);
        li.textContent = name;
  
        // assign the popup template to hurricanes
        hurricane.popupTemplate = popupTemp;
  
        // Add the hurricane to the graphics array
        graphics.push(hurricane);
  
        // Append the list item to the fragment
        fragment.appendChild(li);
      });
  
      // Clear the existing content of listNode and append the updated fragment
      
      listNode.innerHTML = "";
      listNode.appendChild(fragment);
      
      // add event listener to listNode so that clicking sidebar causes popups to generate
      listNode.addEventListener("click", onListClickHandeler);
    });
  
  }
    
  // funciton to listen to click event on the hurricane list
  function onListClickHandeler(event){
    const target = event.target;
    const resultId = target.getAttribute("data-result-id");
  
  // Get the graphic corresponding to the clicked hurricane
    const result = 
      resultId && graphics && graphics[parseInt(resultId, 10)];
  
  // register that there is a result from clicking the sidebar and 
  // generate corresponding popup. Zoom to hurricane feature
    if(result){
      view.goTo(result.geometry.extent.expand(100))             
          .then(function () {
            view.openPopup({
            features: [result],
            location: result.geometry.centroid
            });
          })
    }
  }
  
  });