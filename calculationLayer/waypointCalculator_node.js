var http = require('http');
var turf = require('./turf.min.js');
var url = require('url');

function CalculateWaypoints(dataPoints, res){
    
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

    var distance = turf.distance(from, to, units);
    var cellSize = distance / 5 
    //console.log(cellSize)
    var squareGrid = turf.squareGrid(bbox, cellSize, units);

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

//create a server object:
http.createServer(function (req, res) {
    var queryData = url.parse(req.url, true).query.data;    
    var parsedData = JSON.parse(queryData.replace(/'/g, '"'));
    
    if (parsedData) {
        // Request contains data
        CalculateWaypoints(parsedData, res);
    } else {
        res.write("Sorry, no data on the request. Please include QS param 'data=<bla>'");
    }    

    res.end(); //end the response
}).listen(8080); //the server object listens on port 8080