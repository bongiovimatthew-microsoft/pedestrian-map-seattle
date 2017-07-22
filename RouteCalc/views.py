from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from pprint import pprint as pp
import json
import urllib.request
import urllib.parse

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

def getNodeJSWayPoints(allData):
    # Make request to node.js endpoint 
    fullUrl = "https://waypointcalc.herokuapp.com/" 
    safe = '$\':'
    urlEncodedData = urllib.parse.quote(str(allData), safe = safe).encode('utf8')
    
    postBody = { "data": allData }
    print(postBody)
    
    req = urllib.request.Request(fullUrl)
    req.add_header('Content-Type', 'application/json')
    json_data = json.dumps(postBody).encode('utf8')
    
    response = urllib.request.urlopen(req, timeout = 60, data = json_data)
    wayPointCalcResponseStr = (response.read().decode('utf8'))

    return wayPointCalcResponseStr

def snapToRoadWayPoints(startPointCoord, wayPointsCoordsArray, endPointCoord):
    allPointsToSnapArray = [startPointCoord] + wayPointsCoordsArray + [endPointCoord]
    allPointsToSnapStrArray = ["{0},{1}".format(pointToSnap[0], pointToSnap[1]) for pointToSnap in allPointsToSnapArray]

    print(allPointsToSnapStrArray)
    snapToRoadsGetUrl = "https://roads.googleapis.com/v1/snapToRoads?path={0}&interpolate=false&key={1}".format("|".join(allPointsToSnapStrArray), GOOGLE_API_KEY)
    
    req = urllib.request.Request(snapToRoadsGetUrl)
   
    response = urllib.request.urlopen(req, timeout = 60)
    snappedPointsResponseStr = (response.read().decode('utf8'))

    return snappedPointsResponseStr

def getGeoJSONFromWayPointsCoord(wayPointsCoordsArray):

    # GeoJSON has longitude followed by latitude
    wayPointsGeoJSONDictArray = [
        {
            "type": "feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [wayPointCoord[1], wayPointCoord[0]]
            }
        }

        for wayPointCoord in wayPointsCoordsArray
    ] 

    return wayPointsGeoJSONDictArray

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
    boundingBox = ((requestDict['startLatitude'] - 0.005, requestDict['startLongitude'] - 0.005), (requestDict['endLatitude'] + 0.005, requestDict['endLongitude'] + 0.005))
    knobWeights = requestDict['knobWeights']

    startPointCoord = [requestDict['startLatitude'], requestDict['startLongitude']]
    endPointCoord = [requestDict['endLatitude'], requestDict['endLongitude']]

    allData = aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)    
    print(allData)

    wayPointCalcResponseStr = getNodeJSWayPoints(allData)
    print(wayPointCalcResponseStr)

    wayPointsReceived = json.loads(wayPointCalcResponseStr)
    wayPointsCoordsArray = [[gjWayPoint["geometry"]["coordinates"][1], gjWayPoint["geometry"]["coordinates"][0]] for gjWayPoint in wayPointsReceived] 

    # Sort the array so our route goes from start to end rather than jumbled up
    wayPointsCoordsArray.sort(key=lambda x: wayPointsSortKeyFunc(startPointCoord, x))

    snappedPointsResponseStr = snapToRoadWayPoints(startPointCoord, wayPointsCoordsArray, endPointCoord)
    print(snappedPointsResponseStr)

    snappedPointsReceived = json.loads(snappedPointsResponseStr)
    # print(snappedPointsReceived)
    # print(snappedPointsReceived[0])
    snappedPointsCoordsArray = [[snappedWayPoint["location"]["latitude"], snappedWayPoint["location"]["longitude"]] for snappedWayPoint in snappedPointsReceived["snappedPoints"]] 

    wayPointsGeoJSONDictArray = getGeoJSONFromWayPointsCoord(snappedPointsCoordsArray)

    responseDict = {"waypoints": wayPointsGeoJSONDictArray}
    if ("includeData" in requestDict.keys()):
        responseDict["data"] = allData["features"]

    return JsonResponse(responseDict)
