import json
import urllib.request
import urllib.parse

fullUrl = "http://127.0.0.1:8000/routeCalc/"
knobWeights = {
                "Accessibility": 0.5,
                "Safety":        1,
                "Nature":        0.2,
                "Toilets":       0.1
              }

boundingBox = ((47.636030, -122.365352), (47.578296, -122.288318))

jsonPost = {
                        "startLatitude"    : "47.636030",
                        "startLongitude"   : "-122.365352",
                        "endLatitude"      : "47.578296",
                        "endLongitude"     : "-122.288318",
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