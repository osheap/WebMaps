// Patrick O'Shea Final Project: Mapping Historic Lava Flows from Kilauea Volcano.

// Requires and call backs. 
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/widgets/Legend",
    "esri/widgets/Slider",
    "esri/Graphic",
    "esri/rest/support/Query",
    "esri/widgets/ScaleBar",
    "dijit/Dialog",
   
  ], (Map, MapView, FeatureLayer,ClassBreaksRenderer,SimpleLineSymbol,SimpleFillSymbol,Legend,Slider,Graphic,Query,ScaleBar,Dialog) => {
  
  // Define initial empty variables and array
  let Hurricanes,legend;
  
  // Create a splash page
        const dialog = new Dialog({
          title: "Historic Volcanic Eruptions at Kilauea Volcano, Hawaii",
          content: "Hello! This application displays historic lava flows "+
                   "from the Kilauea Volcano, between "+
                   "1791 and 1982. The original GIS data was obtained from the USGS "+
                   " and can be found by searching doi:10.5066/P9B7904I." +
                   " The slider allows users to cycle between the years 1791 and 1982,"+
                   " which updates the lava flows displayed and total lava flow area counter."+
                   " Clicking on the lava flows will provide information about the historic flow "+
                   " including what material was erupted (lava or tephra), what the lava "+
                   "flow area is in acres, and the dates of the eruption.",
          style:"width:500px"
        });
  
  // Show the splash page when the app loads
    dialog.show();
   
  // Creates map with topo vector basemap 
    const map = new Map({
      basemap: "topo-vector",
    });
  
  // Creates map view
    const view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 10,
      center: [-155.0,  19.35]
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
    
    // Create a pop-up template that displays Lava flow dates, erupted material, and acreage
    
    const popupTemp = {
        title: "{Volcano} Eruption: {Date}",
        content: "Erupted Material: {RockType}<br/>Lava Flow Area (Acres): {AreaAc}",
    fieldInfos: [{
          fieldName: "RockType",
          format: { 
            places: 0 
          }
        },
        {
          fieldName: "AreaAC",
          format: {
            places: 1   
          }
        }]
      };
  
   // Create the year slider and add it to the ui 
   const eruptionSlider = new Slider({
      container: "year",
      min: 1791,
      max: 1982,
      steps: 1,
      values: [1974],
      visibleElements: {
        labels: true,
        rangeLabels: true
      }
    });
    
  view.ui.add("infoDiv", {
  position: "top-right"
  });
  
  
    
  
    
    
    
    
    
    
    
    
    
    
    
  
  
  //Create a new render based on year the eruption ended
    const eruptionRender = new ClassBreaksRenderer({
      field: "yearEnd"
    });
    
    eruptionRender.addClassBreakInfo({
      minValue: 1950,
      maxValue: 1982,
      symbol: new SimpleFillSymbol({
        color: "#fed976",
        style: "solid"
          }),
      label: "Erupted between 1950 and 1982"
        });
    eruptionRender.addClassBreakInfo({
      minValue: 1920,
      maxValue: 1950,
      symbol: new SimpleFillSymbol({
        color: "#feb24c",
        style: "solid"
          }),
      label: "Erupted between 1920 and 1950"
        });
    eruptionRender.addClassBreakInfo({
      minValue: 1890,
      maxValue: 1920,
      symbol: new SimpleFillSymbol({
        color: "#fd8d3c",
        style: "solid"
          }),
      label: "Erupted between 1890 and 1920"
        });
    eruptionRender.addClassBreakInfo({
      minValue: 1860,
      maxValue: 1890,
      symbol: new SimpleFillSymbol({
        color: "#fc4e2a",
        style: "solid"
          }),
      label: "Erupted between 1860 and 1890"
        });
    eruptionRender.addClassBreakInfo({
      minValue: 1830,
      maxValue: 1860,
      symbol: new SimpleFillSymbol({
        color: "#e31a1c",
        style: "solid"
          }),
      label: "Erupted between 1830 and 1860"
        });
    eruptionRender.addClassBreakInfo({
      minValue: 1791,
      maxValue: 1830,
      symbol: new SimpleFillSymbol({
        color: "#b10026",
        style: "solid"
          }),
      label: "Erupted between 1791 and 1830"
        }); 
  
  // Establish initial conditions to populate map
  let eruptionYear = 1974;
  const Eruptions = new FeatureLayer({            url:"https://services9.arcgis.com/6EuFgO4fLTqfNOhu/arcgis/rest/services/Kilauea_Eruptions_from_1792_through_1982/FeatureServer",
    renderer:eruptionRender,
    definitionExpression: "yearStart <= " + eruptionYear,
    outFields:["Date","yearStart","yearEnd","yearDiff"],
    popupTemplate:popupTemp
  });
  map.add(Eruptions);
  createLegend(Eruptions);
  updateTally(eruptionYear);
    
    
  // Function to update the renderer based on the slider value
  function updateRenderer(year) {
    eruptionYear = year; // Update the eruptionYear variable
    const updatedRenderer = createEruptionRender(year);
    Eruptions.renderer = updatedRenderer;
  }
    
  // Define function for visualizing eruptions by year, this will get called every time
  // the slider is manipulated, either by dragging the slider or clicking the slider and
  // using the arrow keys. 
    
  function createEruptions(eruptionYear){
    map.removeAll();
    let graphics = []
      const Eruptions = new FeatureLayer({   
        url:"https://services9.arcgis.com/6EuFgO4fLTqfNOhu/arcgis/rest/services/Kilauea_Eruptions_from_1792_through_1982/FeatureServer",
        renderer:eruptionRender,
        definitionExpression: "yearStart <= " + eruptionYear,
        outFields:["Date","yearStart","yearEnd","yearDiff"],
        popupTemplate:popupTemp
      });
    map.add(Eruptions);
    createLegend(Eruptions); 
  };
  
   
    //create legend function
   function createLegend(Eruptions){ 
    const legend = new Legend({
      view: view,
      layerInfos: [
      {
        layer: Eruptions,
        title: "Kilauea Eruption Time Periods",
      }]
    });
    view.ui.empty("bottom-right");
    view.ui.add(legend, "bottom-right");
  };
  
    
    
    
  // Function to calculate and update the total acreage erupted by the given year
  function updateTally(year) {
    // Define a query to filter features with yearEnd less than eruptionYear
    const query = Eruptions.createQuery();
    query.where = `yearEnd < ${year}`;
    
  // Calculate the total area in acres for the filtered features
  Eruptions.queryFeatures(query).then((result) => {
    const features = result.features;
    let totalArea = 0;
  
    // Sum the AreaAc for each feature
    for (const feature of features) {
    totalArea += feature.attributes.AreaAc || 0;
    }
    // Format the totalArea to one decimal place
    const formattedTotalArea = totalArea.toFixed(1);
    // Update the total in the UI
    const tallyDiv = document.getElementById("tallyDiv");
    tallyDiv.textContent = `Total Lava Flow Area (ac): ${formattedTotalArea}`;
    });
  }; 
    
  // establish on drag functionality to call createEruptions function and update acreage 
  eruptionSlider.on("thumb-drag", function(event) {
    if (event.state === "stop"){
    eruptionYear = event.value;
    createEruptions(eruptionYear);
    updateTally(eruptionYear); 
      }
    });
  
  // establish on change (using the arrows to change year),
  // functionality to call createEruptionss function and update acreage
  eruptionSlider.on("thumb-change", function(event) {
    eruptionYear = event.value;
    createEruptions(eruptionYear);
    updateTally(eruptionYear); 
    });
  });