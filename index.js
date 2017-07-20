var http = require('http');
var turf = require('./turf.min.js');
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json({limit: '500mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true })); // support encoded bodies
app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
    var queryData = request.query.data;
    if(queryData){
        try {
            var parsedData = JSON.parse(queryData.replace(/'/g, '"'));
            
            if (parsedData) {
                // Request contains data, try to use the data 
                CalculateWaypoints(parsedData, response);
            }
        } catch(e) {
            console.log("Something went wrong." + e);
            response.end("Something bad happened on your request. Sorry about that.");
        }
    }else{
        response.write("Sorry, no data on the request. Please include QS param 'data=<bla>'");
    }

    response.end(); //end the response
});

app.post('/', function(request, response) {
    console.log("Receiving request");
    var postBody = request.body; 
    var proccessedRequest = false;
    console.log("POST body:");
    console.log(postBody);
    
    if(postBody){
        var dataFromPost = decodeURI(postBody.data).replace(/%2C/g,",").replace(/'/g, '"');
        while(dataFromPost.charAt(0) !== '{')
        {
            dataFromPost = dataFromPost.substr(1); // Remove leading characters before '{' 
        }
        while(dataFromPost.charAt(dataFromPost.length - 1) !== '}')
        {
            dataFromPost = dataFromPost.substr(0, dataFromPost.length - 1); // Remove trailing characters after '}'
        }

        if(dataFromPost){
            try {
                console.log("Decoded data: ");
                console.log(dataFromPost);
                var parsedData = JSON.parse(dataFromPost);
                if (parsedData) {
                    console.log("Begin waypoint calculation");
                    console.log("Parsed Data: ");
                    console.log(parsedData);
                    
                    // Request contains data, try to use the data 
                    CalculateWaypoints(parsedData, response);
                    proccessedRequest = true;
                }
            } catch(e) {
                console.log("Something went wrong." + e);
                response.write("Something bad happened on your request. Sorry about that.");
            }
        }
    }
    if(!proccessedRequest){
        response.write("Sorry, we could not process your request. Please include POST param 'data=<bla>', and ensure data blob is in the correct GeoJSON format.");
    }

    response.end(); //end the response
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function CalculateWaypoints(dataPoints, res){
    console.log("Starting CalculateWaypoints");
    
    var bbox = turf.bbox(dataPoints);
    var units = 'miles';

    var from = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        // minX, minY 
        "coordinates": [bbox[0], bbox[1]]
      }
    };
    var to = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        // maxX, minY 
        "coordinates": [bbox[2], bbox[1]]
      }
    };

    console.log("Having bounding box, working on square grid");
    
    var distance = turf.distance(from, to, units);
    var cellSize = distance / 5 
    //console.log(cellSize)
    var squareGrid = turf.squareGrid(bbox, cellSize, units);

    console.log("Have square grid, working on collect");
    
    // Collect the 'score' property from each squareGrid cell, and attach it as the 'values' array to each squareGrid cell 
    // "collect" takes every point from 'dataPoints' that is within a givin polygon from 'squareGrid' and adds the 
    //  'score' property of the point to the 'values' array property on each squareGrid polygon
    var collected = turf.collect(squareGrid, dataPoints, 'score', 'values');

    // Iterate throug each cell and add all the collected 'values' property together 
    for(i = 0; i < collected.features.length; i++){
        collected.features[i].properties.totalScore =  collected.features[i].properties.values.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    }

    // Define a compare function to compare polygons by score, from largest to smallest 
    function compare(a,b) {
      if (a.properties.totalScore < b.properties.totalScore)
        return -1;
      if (a.properties.totalScore > b.properties.totalScore)
        return 1;
      return 0;
    }

    console.log("Sorting grid objects");
    
    // Sort the collected set by polygon area, from smallest to largest
    var sortedGrid = collected.features.sort(compare); 
    //console.log(sortedGrid) 

    waypoints = []
    waypointObjs = [] 
    for(i = 0; i < 5; i++){
        waypoints.push(turf.centroid(sortedGrid[i]));
        centroid = {
            "type": "Feature",
            "properties": {
                "icon": "rocket"
            },
            "geometry": turf.centroid(sortedGrid[i]).geometry
        };
        waypointObjs.push(centroid)
    }
    //console.log(waypointObjs)
    var waypointsDisplay = {"type": "FeatureCollection", "features": waypointObjs};
    //res.write(JSON.stringify(waypointsDisplay)); //write a response to the client
    res.write(JSON.stringify(waypoints)); //write a response to the client

    console.log("Done!-----------------------");
    console.log(JSON.stringify(waypoints));
}