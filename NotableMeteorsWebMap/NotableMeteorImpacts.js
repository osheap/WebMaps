require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/PictureMarkerSymbol",
  "esri/widgets/Legend"
], (
  Map, MapView, FeatureLayer, SimpleRenderer, PictureMarkerSymbol, Legend
) => {

  // Create symbol from server instance

  const defaultSym = new PictureMarkerSymbol({
    url:'https://pennstate.maps.arcgis.com/sharing/rest/content/items/277822ec545842839b0ec4299697f021/data',
    width: "20px",
    height: "20px"
  });

  // Use Visual Varables to create meteor data symbology

  const renderer = new SimpleRenderer({
    symbol: defaultSym,
    label: "Meteor Strike",
    visualVariables: [{
      type: "size",
      field: "Diameter__",
      stops: [
        {
          value: 10,
          size: 10,
          label: "10 or Less"
        },
        {
          value: 50,
          size: 20,
          label: "Between 10 and 50"
        },
        {
          value: 100,
          size: 30,
          label: "Between 50 and 100"
        },
        {
          value: 160,
          size: 40,
          label: "100 or Greater"
        }
      ]
    }]
  });

  // Create Template for Pop-ups

  const template = {
      title: "{Crater_Nam} Impact Crater",
      content: "Location: {Location}<br />Crater Diameter (KM): {Diameter__}<br />Crater Age (Million Years): {Age__Ma__}",
      fieldInfos: [{
        fieldName: "Location",
        format: {
          digitSeparator: true, 
          places: 0 
        }
      },
      {
        fieldName: "Diameter__",
        format: {
          places: 1   
        }
      },
      {
        fieldName: "Age__Ma__",
        format: {
          places: 2   
        }
      }]
    };

  // Call Meteor Impactor Data from server instance

  const meteorStrike = new FeatureLayer({
    url:"https://services9.arcgis.com/6EuFgO4fLTqfNOhu/arcgis/rest/services/MeteorStrikes/FeatureServer",
    renderer: renderer,
    popupTemplate: template
  });

  // Set up map with satallite basemap, add meteor data

  const map = new Map({
    basemap: "satellite",
    layers: [meteorStrike]
  });

  // Create map view 
  
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [0, 0],
    zoom: 2
  });

  // Create Legend

  const legend = new Legend({
    view: view,
    layerInfos: [
    {
      layer: meteorStrike,
      title: "Meteor Impact Craters"
    }]
  });

  // Add Legend to Map

  view.ui.add(legend, "bottom-left");
  
  
});