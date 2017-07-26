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

def getNodeJSWayPoints(allData, startEndCoords):
    print("Querying nodeJS for waypoints")
    # Make request to node.js endpoint 
    fullUrl = "https://waypointcalc.herokuapp.com/" 
    safe = '$\':'
    urlEncodedData = urllib.parse.quote(str(allData), safe = safe).encode('utf8')
    
    postBody = { "data": allData,
                 "startLatitude": startEndCoords[0][0],
                 "startLongitude": startEndCoords[0][1],
                 "endLatitude": startEndCoords[1][0],
                 "endLongitude": startEndCoords[1][1] 
               }

    print(postBody)
    
    req = urllib.request.Request(fullUrl)
    req.add_header('Content-Type', 'application/json')
    json_data = json.dumps(postBody).encode('utf8')
    
    response = urllib.request.urlopen(req, timeout = 60, data = json_data)
    wayPointCalcResponseStr = (response.read().decode('utf8'))

    return wayPointCalcResponseStr

def snapToRoadWayPoints(startPointCoord, wayPointsCoordsArray, endPointCoord):
    print("Snapping points to road")
    allPointsToSnapArray = [startPointCoord] + wayPointsCoordsArray + [endPointCoord]
    allPointsToSnapStrArray = ["{0},{1}".format(pointToSnap[0], pointToSnap[1]) for pointToSnap in allPointsToSnapArray]

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

def getRouteUsingBingAPI(snappedPointsCoordsArray, startPointCoord, endPointCoord):
    # Make the request to the bing directions endpoint using
    #  the waypoints calculated in the previous step 
    
    bingReq = "http://dev.virtualearth.net/REST/V1/Routes/Walking?optmz=distance&output=json" 

    # Add start coord
    bingReq += "&wp.0={0},{1}".format(startPointCoord[0], startPointCoord[1])

    # Specifying a waypoint as a Point 
    # The coordinates are double values that are separated by commas and are specified in the following order.
    # Latitude,Longitude
    # Use the following ranges of values:
    # Latitude (degrees): [-90, +90]
    # Longitude (degrees): [-180,+180]
    # Example: 47.610679194331169, -122.10788659751415
    wayPointIndex = 1
    for viaWayPoint in snappedPointsCoordsArray:
        bingReq += "&vwp.{0}={1},{2}".format(wayPointIndex, viaWayPoint[0], viaWayPoint[1])
        wayPointIndex += 1

    # Add end coord and key
    bingReq += "&wp.{0}={1},{2}".format(wayPointIndex, endPointCoord[0], endPointCoord[1])
    bingReq += "&key=AgMjWLP7S38Z3JsJph1CbM45mCskgfNLhkkv3L3SZtpFz35Wvxjvs3r9NJxxUqXf"

    req = urllib.request.Request(bingReq)
    response = urllib.request.urlopen(req, timeout = 10)
    responseStr = response.read() 
    
    print(str(responseStr))
    return


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

    wayPointsGeoJSONDictArray = []

    if (len(allData["features"]) > 0):
        wayPointCalcResponseStr = getNodeJSWayPoints(allData, [startPointCoord, endPointCoord])
        print(wayPointCalcResponseStr)

        wayPointsReceived = json.loads(wayPointCalcResponseStr)
        wayPointsCoordsArray = [[gjWayPoint["geometry"]["coordinates"][1], gjWayPoint["geometry"]["coordinates"][0]] for gjWayPoint in wayPointsReceived] 

        # Sort the array so our route goes from start to end rather than jumbled up
        wayPointsCoordsArray.sort(key=lambda x: wayPointsSortKeyFunc(startPointCoord, x))

        snappedPointsResponseStr = snapToRoadWayPoints(startPointCoord, wayPointsCoordsArray, endPointCoord)
        print(snappedPointsResponseStr)

        snappedPointsReceived = json.loads(snappedPointsResponseStr)
        snappedPointsCoordsArray = [[snappedWayPoint["location"]["latitude"], snappedWayPoint["location"]["longitude"]] for snappedWayPoint in (snappedPointsReceived["snappedPoints"])[1:len(snappedPointsReceived["snappedPoints"]) - 1]] 

        wayPointsGeoJSONDictArray = getGeoJSONFromWayPointsCoord(snappedPointsCoordsArray)

    # Get bing route
    # getRouteUsingBingAPI(snappedPointsCoordsArray, startPointCoord, endPointCoord)

    responseDict = {"waypoints": wayPointsGeoJSONDictArray}
    if ("includeData" in requestDict.keys()):
        responseDict["data"] = allData["features"]

    responseDict["numberPointsUsed"] = len(allData["features"])

    print("Number points used: {0}".format(responseDict["numberPointsUsed"]))

    return JsonResponse(responseDict)
