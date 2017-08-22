var map;
//var routeCalcUrl = "https://routecalculator.herokuapp.com/routeCalc/";
var sourceAutocomplete;
var destAutocomplete;

mapboxgl.accessToken = 'pk.eyJ1IjoiYm9uZ2lvdmltYXR0aGV3IiwiYSI6ImNqMzU1NXlpYzAyMmwzMm5ya2tuYjNuMWMifQ.cxVuCXpkeTawreTAcEnNnQ';

var routeCalcUrl = "http://127.0.0.1:8000/routeCalc/";

var centerLatToUse = 47.606209
var centerLongToUse = -122.332071
var anyKnobsSelected = false;

function ClearMap(){
    try{
        map.removeSource("route");
        map.removeLayer("route");
        map.removeSource("data");
        map.removeLayer("data");
    }
    catch(err){
    }    
}

function DisplayNewRoute(response){

    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": response.path
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#CD0000",
            "line-width": 8
        }
    });

    // Pass the first coordinates in the LineString to `lngLatBounds` &
    // wrap each coordinate pair in `extend` to include them in the bounds
    // result. A variation of this technique could be applied to zooming
    // to the bounds of multiple Points or Polygon geomteries - it just
    // requires wrapping all the coordinates with the extend method.
    var coordinates = response.path.features[0].geometry.coordinates;
    var bounds = coordinates.reduce(function(bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
        padding: 60
    });
                
    // If we are displaying the data, go through the data in the response, and create 
    //  pushpins for everything 
    if(document.getElementById("show-data-switch").checked){
        var pushpins = [];
        
        var dataPointsToUse = response.data;    

        knob_strings = [];
        if (document.getElementById("safety-switch").checked) knob_strings.push("Safety");
        if (document.getElementById("accessibility-switch").checked) knob_strings.push("Accessibility");
        if (document.getElementById("nature-switch").checked) knob_strings.push("Nature");
        if (document.getElementById("toilet-switch").checked) knob_strings.push("Toilets");

        for (var i = 0; i < dataPointsToUse.length; ++i) {
            point_feature = dataPointsToUse[i];

            if(!knob_strings.includes(point_feature["properties"]["knob"])){
                continue;
            }

            // Add color to pushpins
            if (point_feature["properties"]["knob"] == "Accessibility") {
                point_feature["properties"]["color"] = 'blue';
            }
            else if (point_feature["properties"]["knob"] == "Safety") {
                point_feature["properties"]["color"] = 'orange';
            }
            else if (point_feature["properties"]["knob"] == "Nature") {
                point_feature["properties"]["color"] = 'green';
            }
            else if (point_feature["properties"]["knob"] == "Toilets") {
                point_feature["properties"]["color"] = 'yellow';
            }
            
            pushpins.push(point_feature);
        }

        data = {"type": "FeatureCollection", "features": pushpins}

        // add the pushpins data
        map.addLayer({
            'id': 'data',
            'type': 'circle',
            'source': { 
                'type': 'geojson', 
                'data': data
            },
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'circle-radius': 8,
                'circle-color': { property: 'color', type: 'categorical', stops: [['green', '#006600'], ['orange', '#FFA500'], ['blue', '#0000FF'], ['yellow', '#FFFF00']]}
            }            
        });
    }

    if (response.numberPointsUsed == 0) {
        if (anyKnobsSelected) {
           document.getElementById('NoDataDiv').style.display = "block";
        }
    }
    else if (response.numberPointsUsed > 2500) {
        if(document.getElementById("show-data-switch").checked){
           document.getElementById('TooMuchDataDiv').style.display = "block";
       }
    }

    document.getElementById("loadingWheel").style.visibility='hidden'; 
}

function CalculateDirectionsForNewRoute(startWaypointLocation, endWaypointLocation, startWaypointAddress, endWaypointAddress){
    console.log("Enter: CalculateDirectionsForNewRoute");
	
    // Clear any existing data/route from the map
    ClearMap();

    // Get the chosen knobs 
	var knobs = { "Safety": 0, "Accessibility": 0, "Nature": 0, "Toilets": 0 }		
	if (document.getElementById("safety-switch").checked) knobs.Safety = 1;
	if (document.getElementById("accessibility-switch").checked) knobs.Accessibility = 1;
	if (document.getElementById("nature-switch").checked) knobs.Nature = 1;
	if (document.getElementById("toilet-switch").checked) knobs.Toilets = 1;

    anyKnobsSelected = false
    Object.keys(knobs).forEach(function(currentKey) {
        if (knobs[currentKey] != 0) {
            anyKnobsSelected = true
        }
    });

	// Set the request POST body 
    var params = {"startLatitude" : startWaypointLocation[0],
                  "startLongitude": startWaypointLocation[1],
                  "endLatitude": endWaypointLocation[0] ,
                  "endLongitude": endWaypointLocation[1],
                  "knobWeights": knobs,
                  };


    if(document.getElementById("show-data-switch").checked){
        params["includeData"] = 1
    }
    
    console.log("POST Parameters: ")
    console.log(params);
    
    // Make the POST request to the backend 
    var routeCalcReq = new XMLHttpRequest();
    routeCalcReq.open("POST", routeCalcUrl, true);
    
    // Send the proper header information along with the request
    routeCalcReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	// Define the callback function for when we get a response from the backend
	//  This response should contain the waypoints to use, and any data to display  
    routeCalcReq.onreadystatechange = function() {
        if(routeCalcReq.readyState == 4 && routeCalcReq.status == 200) {
            DisplayNewRoute(JSON.parse(routeCalcReq.responseText));
		}               
    }
    
    // Make the request to the backend to get the waypoints, and any data 
    //  we should display 
    routeCalcReq.send(JSON.stringify(params));  

    console.log("Exit: CalculateDirectionsForNewRoute");
}



function loadMap() {
    // Define the map object for route calculation. We set the center and zoom to focus on Seattle.
    map = new mapboxgl.Map({
        container: 'myMap',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-122.332433, 47.606003],
        zoom: 12
    });
}

function InitAutocompleteSource() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    sourceAutocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */(document.getElementById('sourceAddress')),
        // {types: ['geocode']}
        );

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    sourceAutocomplete.addListener('place_changed', UpdateSourceAddress);        

    var geolocation = {
      lat: centerLatToUse,
      lng: centerLongToUse
    };
    var circle = new google.maps.Circle({
      center: geolocation,
      radius: 10000
    });
    sourceAutocomplete.setBounds(circle.getBounds());
}


function InitAutocompleteDest() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    destAutocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */(document.getElementById('destAddress')),
        // {types: ['geocode']}
        );

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    destAutocomplete.addListener('place_changed', UpdateDestAddress);

    var geolocation = {
      lat: centerLatToUse,
      lng: centerLongToUse
    };
    var circle = new google.maps.Circle({
      center: geolocation,
      radius: 10000
    });
    destAutocomplete.setBounds(circle.getBounds());
}

function InitAutocomplete() {
    InitAutocompleteSource();
    InitAutocompleteDest();
}

function UpdateSourceAddress() {
    console.log("Source address updated")
    console.log(sourceAutocomplete.getPlace());
}

function UpdateDestAddress() {
    console.log("Destination address updated")
    console.log(destAutocomplete.getPlace());
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function Geolocate(autocompleteObj) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autocompleteObj.setBounds(circle.getBounds());
      });
    }
}

function GeoLocateSource() {
    console.log("Entered GeoLocateSource")
    Geolocate(sourceAutocomplete);
}

function GeoLocateDest() {
    console.log("Entered GeoLocateDest")
    Geolocate(destAutocomplete);
}

// issue-manigu-07252017 if they input an address, remove it and run click me without putting a proper addrwess, we use the old one
function GetRoute() {
    document.getElementById("loadingWheel").style.visibility='visible'; 
    document.getElementById('NoDataDiv').style.display = "none";
    document.getElementById('TooMuchDataDiv').style.display = "none";

    sourcePlace = sourceAutocomplete.getPlace()
    destPlace = destAutocomplete.getPlace()

    if (! sourcePlace) {
        alert("Need a source address")
        return;
    }

    if (! destPlace) {
        alert("Need a dest address")
        return;
    }

    console.log("Source address:")
    console.log(sourcePlace);

    console.log("Destination address:")
    console.log(destPlace);

    startWaypointLocation = [sourcePlace.geometry.location.lat(), sourcePlace.geometry.location.lng()] 
    endWaypointLocation = [destPlace.geometry.location.lat(), destPlace.geometry.location.lng()] 

    sourcePlaceAddr = sourcePlace.formatted_address
    if(sourcePlace.formatted_address.toLowerCase().indexOf(sourcePlace.name.toLowerCase()) == -1) {
        sourcePlaceAddr = sourcePlace.name + ", " + sourcePlaceAddr
    }    

    destPlaceAddr = destPlace.formatted_address
    if(destPlace.formatted_address.toLowerCase().indexOf(destPlace.name.toLowerCase()) == -1) {
        destPlaceAddr = destPlace.name + ", " + destPlaceAddr;
    }    

    CalculateDirectionsForNewRoute(startWaypointLocation, endWaypointLocation, sourcePlaceAddr, destPlaceAddr);
}