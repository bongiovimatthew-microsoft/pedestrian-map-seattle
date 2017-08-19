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

# issue-manish-06112017 there's prolly a better way to do this 
import sys
#sys.path.insert(0, '..\datacleaners')
from DataCleaners import DataAggregator

GOOGLE_API_KEY = 'AIzaSyDhdh1eXucfnK3EytcFAqTd7rt8-y9N7bw';


def wayPointsSortKeyFunc(startPoint, wayPoint1):
    dist1 = getDistanceBetweenTwoPoints(startPoint, wayPoint1)

    return (dist1)

def getDistanceBetweenTwoPoints(point1, point2):
    return ((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2) ** 0.5

def getWalkingNetworkGraph(boundingBox):

    ox.config(log_file=True, log_console=True, use_cache=True)

    # get the walking network for the bounding box 
    north = max(boundingBox[0][0], boundingBox[1][0]) # min of lats 
    south = min(boundingBox[0][0], boundingBox[1][0]) # max of lats 
    east = max(boundingBox[0][1], boundingBox[1][1]) # max of lons
    west = min(boundingBox[0][1], boundingBox[1][1]) # min of lons

    G = ox.graph_from_bbox(north=north, south=south, east=east, west=west, network_type='walk')
    #fig, ax = ox.plot_graph(G)
    return G

def getLeastCostPath(graph, startLat, startLong, endLat, endLong):
    startNode = getNodeFromLocation(graph, startLat, startLong)
    endNode = getNodeFromLocation(graph, endLat, endLong)

    return nx.shortest_path(graph, startNode, endNode, weight='total_cost') # need to specify source and target by node index 

def edgeCostFromDataPoint(graph, edge, point):
    startNode = graph.node[edge[0]] 
    endNode = graph.node[edge[1]]  
    eps = 50

    point_to_line_distance = abs( (endNode['y'] - startNode['y']) * point['x']  -  (endNode['x'] - startNode['x']) * point['y']  +  endNode['x'] * startNode['y']  - endNode['y'] * startNode['x'])/ math.sqrt( math.pow((endNode['y'] - startNode['y']), 2) + math.pow((endNode['x'] - startNode['x']), 2) )

    if point_to_line_distance < eps: 
        return point['cost']

    return 0

def modifyGraphWithCosts(graph, datapoints):
    for edge in graph.edges_iter(data=True, keys=True):
        total_cost = 0
        
        for feature in datapoints['features']: 
            point = {}
            point['x'] = feature['geometry']['coordinates'][1]
            point['y'] = feature['geometry']['coordinates'][0]
            point['cost'] = feature['properties']['score']

            total_cost += edgeCostFromDataPoint(graph, edge, point)
        
        # Use the add_edge function with the correct key (edge[2]) to update the edge to include the total_cost attr
        if total_cost != 0:
            total_cost *= -1.0
        graph.add_edge(edge[0], edge[1], edge[2], total_cost = total_cost)

    return graph

def getNodeFromLocation(graph, lat, long):
    eps = 0.003
    for node, data in graph.nodes_iter(data=True): 
        if abs(data['x'] - long) < eps:
            if abs(data['y'] - lat) < eps:
                return node
    return -1

# issue-manigu-06112017 remove csrf exempt
# issue-manigu-06112017 using post for now, might want to make this a get?
# todo-manigu-06122017 validate all points are in the request
# Create your views here.
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
    actualcoords = ((requestDict['startLatitude'], requestDict['startLongitude']), (requestDict['endLatitude'], requestDict['endLongitude']))
    knobWeights = requestDict['knobWeights']

    startPointCoord = [requestDict['startLatitude'], requestDict['startLongitude']]
    endPointCoord = [requestDict['endLatitude'], requestDict['endLongitude']]

    allData = aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)    

    print(boundingBox)
    print(allData)

    graph = getWalkingNetworkGraph(boundingBox)

    graph = modifyGraphWithCosts(graph, allData)

    for edge in graph.edges_iter(data=True, keys=True):
        print(edge)

    print("Least cost path") 
    print(getLeastCostPath(graph, startLatitude, startLongitude, endLatitude, endLongitude))

    print("Finished doing all the graph generation stuff")
    
    return JsonResponse({})
