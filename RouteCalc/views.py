from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from pprint import pprint as pp
import json
import urllib.request
import urllib.parse
import osmnx as ox 
import networkx as nx
import math
import sys
from DataCleaners import DataAggregator
from RouteCalc import DirectionsManager

GOOGLE_API_KEY = 'AIzaSyDhdh1eXucfnK3EytcFAqTd7rt8-y9N7bw';

#
# Get the Euclidean distance between two poins 
# 
# Parameters: 
#   point1 - a tuple (x, y)
#   point2 - a tuple (x, y)
#
# Returns: 
#   The Euclidean distance between the points 
#
def getDistanceBetweenTwoPoints(point1, point2):
    return ((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2) ** 0.5

#
# Generate a graph of the walking path network for a given bounding box
#
# Parameters: 
#   boundingBox - Two-tuple of points ((x1, y1), (x2, y2))
#
# Returns: 
#   A networkx MultiGraph of the walking path network, generated from OSM
#
def getWalkingNetworkGraph(boundingBox):

    ox.config(log_file=True, log_console=True, use_cache=True)

    # get the walking network for the bounding box 
    north = max(boundingBox[0][0], boundingBox[1][0]) # min of lats 
    south = min(boundingBox[0][0], boundingBox[1][0]) # max of lats 
    east = max(boundingBox[0][1], boundingBox[1][1]) # max of lons
    west = min(boundingBox[0][1], boundingBox[1][1]) # min of lons

    return ox.graph_from_bbox(north=north, south=south, east=east, west=west, network_type='walk')

#
# Generate a least-cost path through a graph containing nodes with lat/long data
#
# Parameters: 
#   graph - a networkx MultiGraph, containing edges with the 'total_cost' attribute 
#   startLat - the latitude of the starting point for the path 
#   startLong - the longitude of the starting point for the path 
#   endLat - the latitude of the ending point for the path 
#   endLong - the longitude f the ending point for the path 
#
# Returns: 
#   A networkx path (a set of node IDs) for the least-cost path 
#
def getLeastCostPath(graph, startLat, startLong, endLat, endLong):
    startNode = getNodeFromLocation(graph, startLat, startLong)
    endNode = getNodeFromLocation(graph, endLat, endLong)

    return nx.shortest_path(graph, startNode, endNode, weight='total_cost') # need to specify source and target by node index 

#
# Generate the cost a given point has on a given edge 
#
# Parameters: 
#   graph - a networkx MultiGraph 
#   edge - a networkx MultiGraph edge between two nodes
#   point - a datapoint containing three attribues, 'x', 'y', and 'cost'
#
# Returns: 
#   The cost that should be applied to the given edge based on the given datapoint 
#
def edgeCostFromDataPoint(graph, edge, point):
    startNode = graph.node[edge[0]] 
    endNode = graph.node[edge[1]]  
    eps = 0.0001 # About 50 ft (364,000 ft per degree)
    
    point_to_line_distance = 0
    denom = getDistanceBetweenTwoPoints((startNode['x'], startNode['y']), (endNode['x'], endNode['y']))
    if denom == 0: 
        # The current edge starts and ends at the same point
        #  If that's the case, just get the distance between the current point and the edge point
        point_to_line_distance = getDistanceBetweenTwoPoints((startNode['x'], startNode['y']), (point['x'], point['y']))
    else: 
        point_to_line_distance = abs( (endNode['x'] - startNode['x']) * (startNode['y'] - point['y']) - (startNode['x'] - point['x']) * (endNode['y'] - startNode['y']) ) / denom
    
    # If the current point lies exactly on the edge, set a minimum distance for division to work 
    if point_to_line_distance == 0:
        point_to_line_distance = 0.00001

    # If the current point distance is under our epsilon, apply the cost 
    #  decayed over the square of the distance 
    if point_to_line_distance < eps: 
        return point['cost'] #(point['cost'] / (point_to_line_distance ** 2))

    return 0


#
# Generate a GeoJSON path from a set of nodes in the given graph
#
# Parameters: 
#   path - a set of edge IDs 
#   graph - the graph with the full node context 
# 
# Return: 
#   A GeoJSON blob for the path 
#
def getGeoJsonFromPath(path, graph):
    node_features = []
    all_coords = []

    for pathnode in path:
        for node, data in graph.nodes_iter(data=True):  
            if node == pathnode: 
                node_features.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [data['x'], data['y']]}}) #long, lat
                all_coords.append([data['x'], data['y']])
                break
    geoJson = {"type": "FeatureCollection", "features": node_features }
    geoJsonLine = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "LineString", "coordinates": all_coords}}]}

    return geoJsonLine

#
# Modify the edges of a graph with costs based on the supplied datapoints 
#
# Parameters: 
#   graph - networkx MultiGraph, non-null, non-empty
#   datapoints - GeoJson dictionary containing x,y geometry coordinates, and a 'score' property
#
# Returns: 
#   graph - networkx MultiGraph, with edges now containing the 'total_cost' attribute 
#
def modifyGraphWithCosts(graph, datapoints):

    min_score = 1000000000
    max_score = -1000000000
    max_dist = 0

    # Iterate through every edge in the graph, and apply 
    #  the appropriate point weight to the edge cost 
    for edge in graph.edges_iter(data=True, keys=True):
        total_cost = 0
        
        # Iterate through every datapoint to determine its 
        #  weight on the current edge 
        for feature in datapoints['features']: 
            point = {}
            point['x'] = feature['geometry']['coordinates'][0] #long
            point['y'] = feature['geometry']['coordinates'][1] #lat
            point['cost'] = feature['properties']['score']

            total_cost += edgeCostFromDataPoint(graph, edge, point)

        # Use the add_edge function to update the current edge with the total_cost attribute    
        graph.add_edge(edge[0], edge[1], edge[2], total_cost = total_cost)

        if total_cost < min_score: 
            min_score = total_cost 
        if total_cost > max_score: 
            max_score = total_cost 

        edge_dist = edge[3]['length']
        if edge_dist > max_dist: 
            max_dist = edge_dist 

    # Scale the edge weights to be all positive 
    scale_val = abs(max_score - min_score) + min_score
    for edge in graph.edges_iter(data=True, keys=True):
        scaled_cost = scale_val - edge[3]['total_cost']

        # Scale the distance to be between 0 and 1, and then make it half as important as the scaled cost
        scaled_dist = (edge[3]['length'] / max_dist ) / 2 
        graph.add_edge(edge[0], edge[1], edge[2], total_cost = scaled_cost + scaled_dist) 

    return graph

#
# Get the node in the graph that is closest to the given lat/long
#
# Parameters: 
#   graph - a networkx MultiGraph, where each node contains attributes 'x' and 'y' 
#       corresponding to longitude, latitude respectively
#
#   lat - the latitude of the point to locate 
#   lon - the longitude of the point to locate 
#
# Returns: 
#   node ID for the closest node in the graph 
#
def getNodeFromLocation(graph, lat, lon):
    closest_node = 0
    min_distance = 100000000

    for node, data in graph.nodes_iter(data=True): 
        point1 = [data['x'], data['y']]
        point2 = [lon, lat]
        distance = getDistanceBetweenTwoPoints(point1, point2)
        
        if distance < min_distance: 
            min_distance = distance
            closest_node = node 

    return closest_node

# issue-manigu-06112017 remove csrf exempt
# issue-manigu-06112017 using post for now, might want to make this a get?
# todo-manigu-06122017 validate all points are in the request
@csrf_exempt
def RouteCalcCore(request):
    print("request.Method: " + request.method)
    if request.method == "GET":
        return HttpResponse("Use a post request!")

    print("request.POST: ")
    pp(request.body)

    aggregator = DataAggregator.DataAggregator()

    requestBodyString = str(request.body.decode('utf-8'))
    if not requestBodyString: 
        print("Empty request")
        return HttpResponse("Empty request")
        
    requestDict = json.loads(str(request.body.decode('utf-8')))
    
    dateRange = ""

    startLatitude = requestDict['startLatitude']
    startLongitude = requestDict['startLongitude']
    endLatitude = requestDict['endLatitude']
    endLongitude = requestDict['endLongitude']

    #
    # Increase the bounding box around the start/end points 
    #
    if requestDict['startLatitude'] < requestDict['endLatitude']:
        startLatitude -= 0.005
        endLatitude += 0.005
    else:
        startLatitude += 0.005
        endLatitude -= 0.005

    if requestDict['startLongitude'] < requestDict['endLongitude']:
        startLongitude -= 0.005
        endLongitude += 0.005
    else:
        startLongitude += 0.005
        endLongitude -= 0.005

    boundingBox = ((startLatitude, startLongitude), (endLatitude, endLongitude))
    knobWeights = requestDict['knobWeights']

    allData = aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)    

    graph = getWalkingNetworkGraph(boundingBox)
    graph = modifyGraphWithCosts(graph, allData)

    path = getLeastCostPath(graph, requestDict['startLatitude'], requestDict['startLongitude'], requestDict['endLatitude'], requestDict['endLongitude']) 
    geoJsonPath = getGeoJsonFromPath(path, graph)

    directionsMan = DirectionsManager.DirectionsManager()
    directions = directionsMan.getDirectionsForPath(path, graph)
    print(directions)
    responseDict = {"path": geoJsonPath}

    if ("includeData" in requestDict.keys()):
        if len(allData["features"]) > 2500:
            dataIndices = random.sample(range(1, len(allData["features"])), 2500)
            responseDict["data"] = []
            for index in dataIndices:
                responseDict["data"].append(allData["features"][index])

        else:
            responseDict["data"] = allData["features"]

    responseDict["numberPointsUsed"] = len(allData["features"])
    responseDict["directions"] = directions

    return JsonResponse(responseDict)