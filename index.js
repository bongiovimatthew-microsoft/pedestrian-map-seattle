var http = require('http');
var turf = require('./turf.min.js');
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var Graph = require('graphlib').Graph;
var alg = require('graphlib').alg;

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
        var dataFromPost = postBody.data;
        console.log("DataFromPost: ");
        console.log(dataFromPost);

        if(dataFromPost){
            try {
                console.log("Begin waypoint calculation");
                    
                // Request contains data, try to use the data 
                CalculateWaypoints(postBody, response);
                proccessedRequest = true;
                
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

function CreateCostMatrixFromGrid(squareGrid, startPoint, endPoint){
    var costMatrix = [[]];

    var col_count = 0;
    var row_count = 0;
    var last_long = 0;

    var startPointFeature = turf.point(startPoint);
    var endPointFeature = turf.point(endPoint);

    var startCellIndex = [];
    var endCellIndex = [];

    for (var i = 0; i < squareGrid.features.length; i++){

        if (i > 0){
            last_long = squareGrid.features[i - 1].geometry.coordinates[0][0][0];    
        }
        
        var curr_long = squareGrid.features[i].geometry.coordinates[0][0][0]; 
        if (curr_long != last_long){
            row_count++;            
            col_count = 0;
            costMatrix.push([])

            // We have just moved from the first column to the second 
        }else{
            col_count++; 
        }
    
        // Add the cell score to the current (row, col) entry 
        costMatrix[row_count].push([squareGrid.features[i].properties.totalScore, i]);

        // console.log("index, score ", i, squareGrid.features[i].properties.totalScore);
        if(turf.inside(startPointFeature, squareGrid.features[i])){
            // Mark the (row, col) index of the start point 
            startCellIndex = i;
        }
    
        if(turf.inside(endPointFeature, squareGrid.features[i])){
            // Mark the (row, col) index of the end point 
            endCellIndex = i;
        }

    }

    var returnData = { "costMatrix": costMatrix, "startCellIndex": startCellIndex, "endCellIndex": endCellIndex };

    return returnData;
}

function GetGridIndexFromCostMatrix(row, col, costMatrix){
    return costMatrix[row][col][1];
}

function isValidIndex(row, col, costMatrix){
    if(! costMatrix[row]) {
        return false;
    }

    if(costMatrix[row][col]){
        return true;
    }

    return false;
}
function weightFn(e, minValue, maxValue, g) {
    var tempVal = g.edge(e).weight - minValue;

    return (Math.abs(maxValue - minValue)) - tempVal;
}
function GreedySelectWaypoints(squareGrid, startPoint, endPoint, minValue, maxValue){
    // Use Dijkstra's to do shortest path 

    // 1. Build cost matrix from squareGrid
    var costMatrixData = CreateCostMatrixFromGrid(squareGrid, startPoint, endPoint);
    var costMatrix = costMatrixData.costMatrix;


    console.log(costMatrixData)
    // Create a new directed graph
    var g = new Graph();

    // Build graph from costMatrix 
    for(var row = 0; row < costMatrix.length; row++){
        for(var col = 0; col < costMatrix[row].length; col++){
            var curr_index = GetGridIndexFromCostMatrix(row, col, costMatrix);
            g.setNode(curr_index, curr_index);

            if(isValidIndex(row + 1, col, costMatrix)){
                var adjacent_index = GetGridIndexFromCostMatrix(row + 1, col, costMatrix);
                g.setNode(adjacent_index, adjacent_index);
                g.setEdge(curr_index, adjacent_index, { weight: costMatrix[row + 1][col][0]});
            }

            if(isValidIndex(row - 1, col, costMatrix)){
                var adjacent_index = GetGridIndexFromCostMatrix(row - 1, col, costMatrix);
                g.setNode(adjacent_index, adjacent_index);
                g.setEdge(curr_index, adjacent_index, { weight: costMatrix[row - 1][col][0]});
            }

            if(isValidIndex(row, col + 1, costMatrix)){
                var adjacent_index = GetGridIndexFromCostMatrix(row, col + 1, costMatrix);
                g.setNode(adjacent_index, adjacent_index);
                g.setEdge(curr_index, adjacent_index, { weight: costMatrix[row][col + 1][0]});
            }

            if(isValidIndex(row, col - 1, costMatrix)){
                var adjacent_index = GetGridIndexFromCostMatrix(row, col - 1, costMatrix);
                g.setNode(adjacent_index, adjacent_index);
                g.setEdge(curr_index, adjacent_index, { weight: costMatrix[row][col - 1][0]});
            }            
        }
    }
    console.log("minValue: " + minValue)
    console.log("maxValue: " + maxValue)
    var shortDistances = alg.dijkstra(g, costMatrixData.startCellIndex, function(e) { return weightFn(e, minValue, maxValue, g) });  

    var max = 1000000;
    var i = 0;
    var pathCellsArray = [];
    var curr_node = shortDistances[costMatrixData.endCellIndex];
    var curr_node_val = costMatrixData.endCellIndex;

    while(i < max){
        i++;
        if(curr_node_val == costMatrixData.startCellIndex){
            break;
        }

        pathCellsArray.unshift(curr_node);

        curr_node_val = curr_node.predecessor;
        curr_node = shortDistances[curr_node.predecessor];
    }

    console.log("Done doing the shortest path calculations!");
    console.log(pathCellsArray);


    var wayPointStep = Math.ceil(pathCellsArray.length / 8);

    console.log("About to clean up waypoint cells");
    waypointsToReturn = [];
    for(var i = 0; i < pathCellsArray.length; i += wayPointStep){
        var nodeIndex = pathCellsArray[i].predecessor;
        // var waypointCellCenter = turf.centroid(squareGrid.features[nodeIndex]);
        var waypointCellCenter = turf.point(squareGrid.features[nodeIndex].geometry.coordinates[0][3]);
        waypointsToReturn.push(waypointCellCenter);
    }

    console.log("Waypoints returned: ");
    console.log(waypointsToReturn);
    return waypointsToReturn;
}

function CalculateWaypoints(postBody, res){
    console.log("Starting CalculateWaypoints");
    
    var dataPoints = postBody.data;
    var bbox = turf.bbox(dataPoints);

    console.log("Have bounding box, working on square grid");
    
    // var units = 'miles';
    var units = 'feet';
    var cellSize = 300;
    //console.log(cellSize)
    var squareGrid = turf.squareGrid(bbox, cellSize, units);

    console.log("Have square grid, working on collect");
    
    // Collect the 'score' property from each squareGrid cell, and attach it as the 'values' array to each squareGrid cell 
    // "collect" takes every point from 'dataPoints' that is within a givin polygon from 'squareGrid' and adds the 
    //  'score' property of the point to the 'values' array property on each squareGrid polygon
    var collected = turf.collect(squareGrid, dataPoints, 'score', 'values');

    // Iterate throug each cell and add all the collected 'values' property together 
    var minValue =  1000000;
    var maxValue = -1000000;

    var avgScore = 0;
    var sumScore = 0;
    for(i = 0; i < collected.features.length; i++){
        collected.features[i].properties.totalScore =  collected.features[i].properties.values.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        sumScore += collected.features[i].properties.totalScore;

        if(collected.features[i].properties.totalScore < minValue){
            minValue = collected.features[i].properties.totalScore;
        }
        if(collected.features[i].properties.totalScore > maxValue){
            maxValue = collected.features[i].properties.totalScore;
        }
    }
    avgScore = sumScore / collected.features.length

    console.log("avgScore: " + avgScore)

    // Define a compare function to compare polygons by score, from largest to smallest 
    function compare(a,b) {
      if (a.properties.totalScore < b.properties.totalScore)
        return -1;
      if (a.properties.totalScore > b.properties.totalScore)
        return 1;
      return 0;
    }

    var startPoint = [postBody.startLongitude, postBody.startLatitude];
    var endPoint = [postBody.endLongitude, postBody.endLatitude];
    
    console.log("About to start GreedySelectWaypoints");
    var waypoints = GreedySelectWaypoints(collected, startPoint, endPoint, minValue, maxValue);
    console.log("GreedySelectWaypoints is done");

    // Pick waypoints from path cells 




    res.write(JSON.stringify(waypoints)); //write a response to the client
    console.log("Done!-----------------------");
    console.log(JSON.stringify(waypoints));
}