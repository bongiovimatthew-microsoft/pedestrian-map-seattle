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
    boundingBox = ((requestDict['startLatitude'], requestDict['startLongitude']), (requestDict['endLatitude'], requestDict['endLongitude']))
    knobWeights = requestDict['knobWeights']

    allData = aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)
    
    print(allData)
    
    # Make request to node.js endpoint 
    fullUrl = "https://waypointcalc.herokuapp.com/" 
    safe = '$\':'
    urlEncodedData = urllib.parse.quote(str(allData), safe = safe).encode('utf8')
    postBody = { "data": urlEncodedData }
    
    print(postBody)
    
    req = urllib.request.Request(fullUrl)
    response = urllib.request.urlopen(req, timeout = 10, data = urlEncodedData)
    responseStr = (response.read().decode('utf8'))
    print(responseStr)
    
    # Make the request to the bing directions endpoint using
    #  the waypoints calculated in the previous step 
    
    bingReq = "http://dev.virtualearth.net/REST/V1/Routes/Walking?optmz=distance&output=json" 

    # Specifying a waypoint as a Point 
    # The coordinates are double values that are separated by commas and are specified in the following order.
    # Latitude,Longitude
    # Use the following ranges of values:
    # Latitude (degrees): [-90, +90]
    # Longitude (degrees): [-180,+180]
    # Example: 47.610679194331169, -122.10788659751415
    i = 0
    for waypointObj in json.loads(responseStr):
        long = waypointObj['geometry']['coordinates'][0]
        lat = waypointObj['geometry']['coordinates'][1]
        bingReq += "&wp." + str(i) + "=" + str(lat) + "," + str(long)
        i+= 1

    bingReq += "&key=AgMjWLP7S38Z3JsJph1CbM45mCskgfNLhkkv3L3SZtpFz35Wvxjvs3r9NJxxUqXf"
    
    req = urllib.request.Request(bingReq)
    response = urllib.request.urlopen(req, timeout = 10)
    responseStr = response.read() 
    
    print(str(responseStr))
    
    return JsonResponse(allData)
