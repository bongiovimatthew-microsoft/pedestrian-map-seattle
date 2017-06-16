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
var startPoint;
var endPoint; 

var sendRequestFunction = function() {
    var http = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/routeCalc/";
    var knobs = { "Accessibility": 0.5, "Safety": 1, "Nature": 0.2, "Toilets": 0.1 }
    var params = {"startLatititude" : startPoint[0], "startLongitude": startPoint[1], "endLatititude": endPoint[0], "endLongitude": endPoint[1], "knobWeights": knobs}
    
    console.log(params)
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(params);
}

calcButton.onclick = function() {
    var data = draw.getAll();
    if (data.features.length > 0) {
        // Get the first two points drawn on the map 
        startPoint = data.features[0].geometry.coordinates[0][0];
        endPoint = data.features[0].geometry.coordinates[0][1];
        
        // Make the backend call to the route calc API 
        sendRequestFunction();
    } else {
        alert("Use the draw tools to draw a polygon!");
    }
};

