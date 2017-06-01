import base64
import json
import time
from datetime import datetime, timedelta

try:
    # Python 3
    from urllib.request import urlopen, Request
except ImportError:
    # Fallback for Python 2
    from urllib2 import urlopen, request

	
baseUrl = "https://data.seattle.gov/resource/pu5n-trf4.json" 

url = "https://data.seattle.gov/resource/pu5n-trf4.json?$where=at_scene_time%20between%20'2017-05-15T20:00:00'%20and%20'2017-05-24T23:00:00'&initial_type_group=ROAD%20RAGE"

#$where=longitude < -122.325458
#$where=longitude > -122.293172


print (time.strftime("%Y-%m-%dT%H:%M:%S"))

# function GetCleanData(BoundingBox, DateRange, Filters)  returns GeoJSON


d = datetime.today() - timedelta(days=14)

$where=at_scene_time between '2017-05-15T20:00:00' and '2017-05-24T23:00:00'


response = urlopen(url)
data = json.loads(response.read().decode('utf-8'))
featureArray = []
count = 0;
for pointObj in data: 
	print(pointObj['longitude'] + ", " + pointObj['latitude'])
	currFeature = "{ \"type\": \"Feature\", \"properties\": { \"icon\": \"monument\" }, \"geometry\": { \"type\": \"Point\", \"coordinates\": [" + pointObj['longitude'] + ", " + pointObj['latitude'] + "] } }"
	featureArray.append(currFeature)
	count += 1
	if(count > 20):
		exit



fullObj = "{ \"type\": \"FeatureCollection\", \"features\":" + str(featureArray) + "}"
#fullObjJson = json.loads(fullObj)
print(fullObj)

#{
#"type": "FeatureCollection",                                                                        
#"features": [
#{ "type": "Feature", "properties": { "Primary ID": "1.26", "Secondary ID": "7km NE of Lake Arrowhead, California" }, "geometry": { "type": "Point", "coordinates": [ -117.1413333, 34.297 ] } },
#{ "type": "Feature", "properties": { "Primary ID": "1.87", "Secondary ID": "13km NNE of Pahala, Hawaii" }, "geometry": { "type": "Point", "coordinates": [ -155.434494, 19.3199997 ] } },