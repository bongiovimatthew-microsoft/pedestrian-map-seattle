from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
import urllib.request
import urllib.parse
import sys
from DataCleaners import DataAggregator
from RouteCalc import GraphManager
from RouteCalc import RequestHandler
from RouteCalc import JsonCommunicator

# issue-manigu-06112017 remove csrf exempt
# todo-manigu-06122017 validate all points are in the request
@csrf_exempt
def RouteCalcCore(request):
    
    errorResponse, requestDict = RequestHandler.getDecodedRequest(request)

    if errorResponse:
        return errorResponse

    aggregator = DataAggregator.DataAggregator()
    responseDict = {}
    
    dateRange = ""
    knobWeights = requestDict['knobWeights']
    includeData = "includeData" in requestDict.keys()

    boundingBox = GraphManager.generateBoundingBox(requestDict['startLatitude'], requestDict['startLongitude'], requestDict['endLatitude'], requestDict['endLongitude'])
    allData = aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)
    routeGeoJson, directionsJson, graph = GraphManager.getRouteAndDirections(allData, requestDict['startLatitude'], requestDict['startLongitude'], requestDict['endLatitude'], requestDict['endLongitude'], True) 

    if (includeData):
        if len(allData["features"]) > 2500:
            dataIndices = random.sample(range(1, len(allData["features"])), 2500)
            responseDict["data"] = []
            for index in dataIndices:
                responseDict["data"].append(allData["features"][index])

        else:
            responseDict["data"] = allData["features"]

        geoJsonAllEdges = JsonCommunicator.getGeoJsonForAllEdges(graph)
        responseDict["allEdges"] = geoJsonAllEdges

    #
    # Build response 
    #
    responseDict["numberPointsUsed"] = len(allData["features"])
    responseDict["directions"] = directionsJson
    responseDict["path"] = routeGeoJson

    return JsonResponse(responseDict)