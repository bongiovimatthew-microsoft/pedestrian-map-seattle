var map;
var routeCalcUrl = "https://routecalculator.herokuapp.com/routeCalc/";
var sourceAutocomplete;
var destAutocomplete;

mapboxgl.accessToken = 'pk.eyJ1IjoiYm9uZ2lvdmltYXR0aGV3IiwiYSI6ImNqMzU1NXlpYzAyMmwzMm5ya2tuYjNuMWMifQ.cxVuCXpkeTawreTAcEnNnQ';

//var routeCalcUrl = "http://127.0.0.1:8000/routeCalc/";

var centerLatToUse = 47.606209
var centerLongToUse = -122.332071
var anyKnobsSelected = false;
// var arrOfColors =  [['green', '#006600'], ['orange', '#FFA500'], ['blue', '#0000FF'], ['red', '#FF0000']]

// var arrOfColors = [['1','#FF0000'], ['2','#FF3200'], ['3','#FF6600'], ['4','#FF9900'], ['5','#FFCC00'], ['6','#FFFF00'], ['7','#CCFF00'], ['8','#99FF00'], ['9','#65FF00'], ['10','#32FF00'], ['11','#00FF00'], ['12','#00FF33'], ['13','#00FF65'], ['14','#00FF99'], ['15','#00FFCB'], ['16','#00FFFF'], ['17','#00CBFF'], ['18','#0099FF'], ['19','#0065FF'], ['20','#0033FF'], ['21','0000FF']]
var arrOfColors = [['0','#FF0000'], ['1','#FF3200'], ['2','#FF6600'], ['3','#FF9900'], ['4','#FFCC00'], ['5','#FFFF00'], ['6','#CCFF00'], ['7','#99FF00'], ['8','#65FF00'], ['9','#32FF00'], ['10','#00FF00'], ['11','#00FF33'], ['12','#00FF65'], ['13','#00FF99'], ['14','#00FFCB'], ['15','#00FFFF'], ['16','#00CBFF'], ['17','#0099FF'], ['18','#0065FF'], ['19','#0033FF'], ['20','#0000FF']];

function ClearMap(){
    try{
        map.removeSource("route");
        map.removeLayer("route");
    }
    catch(err){
        console.log("Failed to clear map route")
        console.log(err)
    }    

    try{
        map.removeSource("allEdges");
        map.removeLayer("allEdges");
    }
    catch(err){
        console.log("Failed to clear map all edges")
        console.log(err)
    }    

    try{
        map.removeSource("data");
        map.removeLayer("data");
    }
    catch(err){
        console.log("Failed to clear map data")
        console.log(err)
    }    

    var directionsTable = document.getElementById('directionsTable');
    directionsTable.innerHTML = "";
}

function edgeColor(feature) {
    total_cost = feature.properties.total_cost;
    total_cost = 20 - Math.round((total_cost * 10) % 21);
    console.log(total_cost)
    return total_cost.toString();

    // if (total_cost > 1.5) {
    //     return "red"
    // } 
    // else if (total_cost > 1.0) {
    //     return "orange"
    // } 
    // else if (total_cost > 0.5) {
    //     return "green"
    // } 
    // else {
    //     return "blue"
    // }
}

function DisplayDirections(directions){
    var directionsTable = document.getElementById('directionsTable');

    for (i = 0; i < directions.length; i++) {
        current_dir = directions[i];

        var row = directionsTable.insertRow(i);
        var cell = row.insertCell(0);
        cell.innerHTML = current_dir.direction + "<br>" + "Go " + Math.ceil(current_dir.length * 3.281) + " feet" + "<br>";
    }
}

function DisplayNewRoute(response){
    console.log(response);

    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": response.path
        },
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-color": "#CD0000",
            "line-dasharray": [0,1.5],
            "line-width": 7
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
                'circle-radius': 4,
                'circle-color': { property: 'color', type: 'categorical', stops: [['green', '#006600'], ['orange', '#FFA500'], ['blue', '#0000FF'], ['yellow', '#FFFF00']]}
            }            
        });

        // Display the edges with weights
        {
            // Build an array of linestrings for each edge
            var edgesLines = [];
            
            // Build a layer for each feature and push it into the empty array
            var i;
            
            for (i = 0; i < response.allEdges.features.length; i++) {
                response.allEdges.features[i].properties['color'] = edgeColor(response.allEdges.features[i])

                edgesLines.push(response.allEdges.features[i]);
            }

            data = {"type": "FeatureCollection", "features": edgesLines}

            // add the pushpins data
            map.addLayer({
                'id': 'allEdges',
                'type': 'line',
                'source': { 
                    'type': 'geojson', 
                    'data': data
                },
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    // 'circle-radius': 8,
                    'line-color': { property: 'color', type: 'categorical', stops: arrOfColors}
                }            
            }); 
        }        

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

    DisplayDirections(response.directions);

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