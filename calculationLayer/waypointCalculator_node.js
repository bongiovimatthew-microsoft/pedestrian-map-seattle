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
    res.write(JSON.stringify(waypointsDisplay)); //write a response to the client
    
}

//create a server object:
http.createServer(function (req, res) {
    var queryData = url.parse(req.url, true).query;
    
    if (queryData.data) {
        // Request contains data
        CalculateWaypoints(queryData.data, res);
    } else {
        res.write("Sorry, no data on the request. Please include QS param 'data=<bla>'");
    }
    
    //var points = {'type':'FeatureCollection','features':[{'properties':{'latitude':'47.615568','longitude':'-122.315096','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.315096,47.615568]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614945','longitude':'-122.317119','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.317119,47.614945]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616492','longitude':'-122.318952','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.318952,47.616492]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.610653','longitude':'-122.317111','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.317111,47.610653]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61806','longitude':'-122.30883','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30883,47.61806]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616768','longitude':'-122.321353','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.321353,47.616768]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.618027','longitude':'-122.311823','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.311823,47.618027]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617859','longitude':'-122.310516','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310516,47.617859]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617361','longitude':'-122.310517','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310517,47.617361]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616957','longitude':'-122.315182','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.315182,47.616957]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614926','longitude':'-122.313852','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.313852,47.614926]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.613183','longitude':'-122.32175','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.32175,47.613183]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.612262','longitude':'-122.322088','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.322088,47.612262]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617756','longitude':'-122.319136','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319136,47.617756]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.618565','longitude':'-122.321954','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.321954,47.618565]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617013','longitude':'-122.319134','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319134,47.617013]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614233','longitude':'-122.313032','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.313032,47.614233]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617309','longitude':'-122.300994','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.300994,47.617309]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.611801','longitude':'-122.3124','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.3124,47.611801]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.6131107170061','longitude':'-122.310543098826','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310543098826,47.6131107170061]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.613126','longitude':'-122.310569','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310569,47.613126]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61654','longitude':'-122.319302','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319302,47.61654]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.611881','longitude':'-122.312577','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.312577,47.611881]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61157','longitude':'-122.30013','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30013,47.61157]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617309','longitude':'-122.300993','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.300993,47.617309]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.615449','longitude':'-122.318367','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.318367,47.615449]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.612259','longitude':'-122.319318','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319318,47.612259]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.615313','longitude':'-122.311587','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.311587,47.615313]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61651','longitude':'-122.30839','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30839,47.61651]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61713','longitude':'-122.307','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.307,47.61713]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61393','longitude':'-122.31743','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.31743,47.61393]},'score':1,'icon':'monument'}]};
    //CalculateWaypoints(points, res);
    res.end(); //end the response
}).listen(8080); //the server object listens on port 8080