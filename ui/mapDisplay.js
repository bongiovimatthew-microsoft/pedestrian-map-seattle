// API Key 
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9uZ2lvdmltYXR0aGV3IiwiYSI6ImNqMzU1NXlpYzAyMmwzMm5ya2tuYjNuMWMifQ.cxVuCXpkeTawreTAcEnNnQ';

// Code taken from example at: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ 
// Note: we will want to migrate this to the Bing Maps API for our true front-end, but the ease of getting the example started with Mapbox 
//  caused me to use it here, temporarily

// Define the map object for route calculation. We set the center and zoom to focus on Seattle.
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-122.332433, 47.606003],
    zoom: 12
});
	
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});
map.addControl(draw);

var calcButton = document.getElementById('calculate');
calcButton.onclick = function() {
    var data = draw.getAll();
    if (data.features.length > 0) {
        // TODO: Make backend call with bounding box
    } else {
        alert("Use the draw tools to draw a polygon!");
    }
};