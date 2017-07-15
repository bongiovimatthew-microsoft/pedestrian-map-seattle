// API Key 
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9uZ2lvdmltYXR0aGV3IiwiYSI6ImNqMzU1NXlpYzAyMmwzMm5ya2tuYjNuMWMifQ.cxVuCXpkeTawreTAcEnNnQ';

// Code taken from example at: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ 

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

map.on('mousemove', function (e) {
    // document.getElementById('info').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
    //    JSON.stringify(e.point) + '<br />' +
            // e.lngLat is the longitude, latitude geographical position of the event
    //    JSON.stringify(e.lngLat);
});

var calcButton = document.getElementById('calculate');
var startPoint;
var endPoint; 

var sendRequestFunction = function(knobs) {
    var http = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/routeCalc/";
    // var knobs = { "Accessibility": 0.5, "Safety": 1, "Nature": 0.2, "Toilets": 0.1 }
    var params = {"startLatitude" : startPoint[1], "startLongitude": startPoint[0], "endLatitude": endPoint[1], "endLongitude": endPoint[0], "knobWeights": knobs}
    
    console.log(params)
    console.log(JSON.stringify(params))
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("Access-Control-Allow-Origin", "*");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(JSON.stringify(params));
}

calcButton.onclick = function() {
    var data = draw.getAll();
    if (data.features.length > 0) {
        // Get the first two points drawn on the map 
        startPoint = data.features[0].geometry.coordinates[0][0];
        endPoint = data.features[0].geometry.coordinates[0][1];
        
		// Get the chosen knobs 
		var knobs = {}		
		if (document.getElementById("safety-switch").checked) knobs.Safety = 1;
		if (document.getElementById("accessibility-switch").checked) knobs.Accessibility = 1;
		if (document.getElementById("nature-switch").checked) knobs.Nature = 1;
		if (document.getElementById("toilet-switch").checked) knobs.Toilets = 1;		
		
        // Make the backend call to the route calc API 
        sendRequestFunction(knobs);
    } else {
        alert("Use the draw tools to draw a polygon!");
    }
};

