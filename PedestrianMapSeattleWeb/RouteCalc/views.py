from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from pprint import pprint as pp
import json
import urllib.request
import urllib.parse

# issue-manish-06112017 there's prolly a better way to do this 
import sys
sys.path.insert(0, '..\datalayer')
from DataAggregator import DataAggregator


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

    aggregator = DataAggregator()

    
    requestBodyString = str(request.body.decode('utf-8'))
    print(requestBodyString)
    if not requestBodyString: 
        print("Empty request")
        return HttpResponse("Empty request")
        
    requestDict = json.loads(str(request.body.decode('utf-8')))
    print(requestDict)

    dateRange = ""
    boundingBox = ((requestDict['startLatitude'], requestDict['startLongitude']), (requestDict['endLatitude'], requestDict['endLongitude']))
    knobWeights = requestDict['knobWeights']

    allData = aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)
    print(allData)

    # Make request to node.js endpoint 
    fullUrl = "http://127.0.0.1:8080?data="
    safe = '$\':'
    fullUrl += urllib.parse.quote(allData, safe = safe)

    req = urllib.request.Request(fullUrl)
    response = urllib.request.urlopen(req, timeout = 10)
    responseStr = (response.read().decode('utf8'))
    print(responseStr)
    
    return JsonResponse(allData)
