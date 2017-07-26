var map;
var directionsManager;
var bingMapsAPIKey = 'AgMjWLP7S38Z3JsJph1CbM45mCskgfNLhkkv3L3SZtpFz35Wvxjvs3r9NJxxUqXf';
var routeCalcUrl = "https://routecalculator.herokuapp.com/routeCalc/";
var sourceAutocomplete;
var destAutocomplete;

// var routeCalcUrl = "http://127.0.0.1:8000/routeCalc/";

var oldRouteCoords = [];
var actualWayPoints = [];

function getDistanceBetweenTwoPoints(coord1, coord2) {
    return Math.sqrt(Math.pow(coord1[1] - coord2[1], 2) + Math.pow(coord1[0] - coord2[0], 2))
}

function checkIfTwoPointsAreTheSame(coord1, coord2) {
    return (getDistanceBetweenTwoPoints(coord1, coord2) < 0.0001);
}

function indexOfMin(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var min = arr[0];
    var minIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }
    return minIndex;
}

function checkIfFormattedItineraryTextSaysTurnBack(formattedItineraryPathText) {
    stringsIndicatingUTurn = ["turn back", "head back"]
    for (var stringIndicatingUTurnInIndex = 0; stringIndicatingUTurnInIndex < stringsIndicatingUTurn.length; stringIndicatingUTurnInIndex++) {
        stringIndicatingUTurn = stringsIndicatingUTurn[stringIndicatingUTurnInIndex];
        if(formattedItineraryPathText.toLowerCase().indexOf(stringIndicatingUTurn) != -1) {
            return true
        }                    
    }
    return false;
}

function ClearAndResetRouteData(){
	// Clear any previously calculated directions.
    directionsManager.clearAll();

    // Reset the options that we want on directionsManager
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking, routeOptimization: Microsoft.Maps.Directions.RouteOptimization.shortestDistance });
    directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
}

function CalculateDirectionsForNewRoute(startWaypointLocation, endWaypointLocation){
    console.log("Enter: CalculateDirectionsForNewRoute");
	
	console.log("startWaypointLocation: " + startWaypointLocation);
	console.log("endWaypointLocation: " + endWaypointLocation);
	
	// Clear everything and try to start anew 
	ClearAndResetRouteData();

    // Create waypoints, and add them to directionsManager
    var startWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: new Microsoft.Maps.Location(startWaypointLocation[0], startWaypointLocation[1]) });
    var endWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: new Microsoft.Maps.Location(endWaypointLocation[0], endWaypointLocation[1])});
    directionsManager.addWaypoint(startWaypoint);
    
    // Get the chosen knobs 
	var knobs = { "Safety": 0, "Accessibility": 0, "Nature": 0, "Toilets": 0 }		
	if (document.getElementById("safety-switch").checked) knobs.Safety = 1;
	if (document.getElementById("accessibility-switch").checked) knobs.Accessibility = 1;
	if (document.getElementById("nature-switch").checked) knobs.Nature = 1;
	if (document.getElementById("toilet-switch").checked) knobs.Toilets = 1;	

	console.log("Knobs: ")
	console.log(knobs);

	// Set the request POST body 
    var params = {"startLatitude" : startWaypointLocation[0],
                  "startLongitude": startWaypointLocation[1],
                  "endLatitude": endWaypointLocation[0] ,
                  "endLongitude": endWaypointLocation[1],
                  "knobWeights": knobs,
                  "includeData": 1
                  };
    
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
            var pushpins = [];
            
            var viaWaypointsToUse = (JSON.parse(routeCalcReq.responseText)).waypoints;
            console.log("Got WayPoints Back:");
            console.log(viaWaypointsToUse);
            actualWayPoints = [];
            
            // Iterate through the via waypoints and add to actualWayPoints list
            for (var i = 0; i < viaWaypointsToUse.length; i++) {
                var latlng = [
                    viaWaypointsToUse[i].geometry.coordinates[1],
                    viaWaypointsToUse[i].geometry.coordinates[0]];
                actualWayPoints.push(latlng);
            }
            		
            // Take the waypoints returned from the backend and add them to the 
            //  directionsManager as Waypoint objects 
            //  Also, add pushpins if we are displaying the data 		
			for (var i = 0; i < actualWayPoints.length; ++i) {
                var actualWayPoint = actualWayPoints[i];
                //Create custom Pushpin
                var pointLoc = new Microsoft.Maps.Location(actualWayPoint[0], actualWayPoint[1]);
                
                if(document.getElementById("show-data-switch").checked){
                	var pin = new Microsoft.Maps.Pushpin(pointLoc, {
                    	color: 'red'
                	});
             	   pushpins.push(pin);
            	}

                // create the via point to add to the direction manager
                var viaWayPoint = new Microsoft.Maps.Directions.Waypoint({ location: pointLoc, isViaPoint: true });
                directionsManager.addWaypoint(viaWayPoint);
            }

            // If we are displaying the data, go through the data in the response, and create 
            //  pushpins for everything 
            if(document.getElementById("show-data-switch").checked){
	            var dataPointsToUse = (JSON.parse(routeCalcReq.responseText)).data;			
	            for (var i = 0; i < dataPointsToUse.length; ++i) {
	                dp = dataPointsToUse[i];

	                //Create custom Pushpin
	                var pointLoc = new Microsoft.Maps.Location(dp["geometry"]["coordinates"][1], dp["geometry"]["coordinates"][0]);
	                var color = 'green'
	                if (dp["properties"]["knob"] == "Accessibility") {
	                    color = 'blue';
	                }
	                else if (dp["properties"]["knob"] == "Safety") {
	                    color = 'orange';
	                }
	                else if (dp["properties"]["knob"] == "Nature") {
	                    color = 'green';
	                }
	                else if (dp["properties"]["knob"] == "Toilets") {
	                    color = 'yellow';
	                }
	                var pin = new Microsoft.Maps.Pushpin(pointLoc, {
	                    color: color
	                });
	                pushpins.push(pin);
	            }

	            // add the pushpins data
	            var layer = new Microsoft.Maps.Layer();
	            layer.add(pushpins);
	            map.layers.insert(layer);
        	}

        	// Add end waypoint to directionsManager now that we have added all 
			//  the via waypoints returned from the backend 
	        directionsManager.addWaypoint(endWaypoint);
	        oldRouteCoords = [startWaypointLocation, endWaypointLocation];

	        // Calculate directions using the new data 
	        // Calculates directions based on request and render options set (setRequestOptions, setRenderOptions) and the waypoints 
	        // added (addWaypoint). 
	        // The directionsUpdated event fires when the calculation is complete and the route is displayed on the map.
	   		// You must call this method after making any changes to the route options or waypoints for these changes to take effect.
	        directionsManager.calculateDirections();    

	        console.log("Waypoints data: ");
	        console.log(actualWayPoints);
	        console.log(directionsManager.getAllWaypoints());
		}               
    }
    
    // Make the request to the backend to get the waypoints, and any data 
    //  we should display 
    routeCalcReq.send(JSON.stringify(params));  

    console.log("Exit: CalculateDirectionsForNewRoute");
}

function RemoveSwitchbacksFromRoute(route){
	console.log("Enter: RemoveSwitchbacksFromRoute");

	for (var itineraryLegsIndex = 0; itineraryLegsIndex < route[0].routeLegs[0].itineraryItems.length; itineraryLegsIndex++) {
        if ((route[0].routeLegs[0].itineraryItems[itineraryLegsIndex].maneuver === "Unknown") &&
            (checkIfFormattedItineraryTextSaysTurnBack(route[0].routeLegs[0].itineraryItems[itineraryLegsIndex].formattedText))) {
            
            console.log("Found itinerary saying head back");
            
            // Iterate through waypoints and remove the one that's most likely causing the switch back 
            for (var wpIndex = 0; wpIndex < actualWayPoints.length; wpIndex++) {
                if (checkIfTwoPointsAreTheSame(actualWayPoints[wpIndex], [route[0].routeLegs[0].itineraryItems[itineraryLegsIndex].coordinate.latitude, route[0].routeLegs[0].itineraryItems[itineraryLegsIndex].coordinate.longitude])) {
                    
                    console.log("Found matching way point, removing it");
                    console.log(wpIndex);

                    // Remove the wp since its causing a u turn
                    directionsManager.removeWaypoint(wpIndex + 1);
                    
                    // Set the element in which the itinerary will be rendered
                    directionsManager.calculateDirections();
                    actualWayPoints.splice(wpIndex, 1)
                    return;
                }
            }

            // None of the way points match exactly so find the closest and kill that one
            distToWayPoints = []
            for (var wpIndex = 0; wpIndex < actualWayPoints.length; wpIndex++) {
                distToWayPoints.push((getDistanceBetweenTwoPoints(actualWayPoints[wpIndex], [route[0].routeLegs[0].itineraryItems[itineraryLegsIndex].coordinate.latitude, route[0].routeLegs[0].itineraryItems[itineraryLegsIndex].coordinate.longitude])))
            }
            var minDistIndex = indexOfMin(distToWayPoints)
            if (-1 === minDistIndex) {
                return;
            }

            console.log("Removing waypoint closest to turn back");
            console.log(minDistIndex);

            actualWayPoints.splice(minDistIndex, 1);
            // Remove the wp since its causing a u turn
            directionsManager.removeWaypoint(minDistIndex + 1);

            // Calculate directions using the new data 
            directionsManager.calculateDirections();
            return;
        }
    }

    console.log("Exit: RemoveSwitchbacksFromRoute");	
}


/*
 Callback function for "directionsUpdated" event, which gets called by the Bing 
  DirectionsManager when: 

  "Occurs when the directions calculation was successful and the itinerary and route on the map have been updated"
*/
function directionsUpdatedFunc(directionsEvent) {
    console.log("Enter: directionsUpdated callback");

    var startWaypointLocation = [directionsEvent.route[0].routeLegs[0].startWaypointLocation.latitude, directionsEvent.route[0].routeLegs[0].startWaypointLocation.longitude]
    var endWaypointLocation = [directionsEvent.route[0].routeLegs[0].endWaypointLocation.latitude, directionsEvent.route[0].routeLegs[0].endWaypointLocation.longitude]
    var currentRouteCoords = [startWaypointLocation, endWaypointLocation];       
    var route = directionsManager.getRouteResult();

    RemoveSwitchbacksFromRoute(route, directionsManager);

    document.getElementById("loadingWheel").style.visibility='hidden'; 

    console.log("Exit: directionsUpdated callback");          
}

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        credentials: bingMapsAPIKey,
        center: new Microsoft.Maps.Location(47.606209, -122.332071),
        zoom: 12
    });

    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        
        // Set Route Mode to walking
        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking, routeOptimization: Microsoft.Maps.Directions.RouteOptimization.shortestDistance });
        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
        
        Microsoft.Maps.Events.addHandler(
          directionsManager,
          'directionsUpdated',
          directionsUpdatedFunc);               
    });
}

function initAutocompleteSource() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    sourceAutocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */(document.getElementById('sourceAddress')),
        // {types: ['geocode']}
        );

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    sourceAutocomplete.addListener('place_changed', UpdateSourceAddress);
}


function initAutocompleteDest() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    destAutocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */(document.getElementById('destAddress')),
        // {types: ['geocode']}
        );

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    destAutocomplete.addListener('place_changed', UpdateDestAddress);
}

function initAutocomplete() {
    initAutocompleteSource();
    initAutocompleteDest();
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

    CalculateDirectionsForNewRoute(startWaypointLocation, endWaypointLocation);
}