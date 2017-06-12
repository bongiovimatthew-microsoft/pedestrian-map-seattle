import json
import urllib.request
import urllib.parse

import sys
sys.path.insert(0, '..\datalayer')
print(sys.path)
from DataAggregator import DataAggregator

fullUrl = "http://127.0.0.1:8000/routeCalc/"
knobWeights = {
           "Safety" : 1
        }

jsonPost = {
                        "startLatitude"    : "111.11",
                        "startLongitude"   : "222.22",
                        "endLatitude"      : "333.33",
                        "endLongitude"     : "444.44",
                        "knobWeights"      : knobWeights
                    }
               
headers = {'Content-Type': 'application/json'}
req = urllib.request.Request(fullUrl, data=json.dumps(jsonPost).encode('utf8'), headers=headers)
response = urllib.request.urlopen(req)
responseStr = (response.read().decode('utf8'))
if responseStr != "Got RouteCalc Request!":
    print("FAILED to post data")
else:
    print("Success")