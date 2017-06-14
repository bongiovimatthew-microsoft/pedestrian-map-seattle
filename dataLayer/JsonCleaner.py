import json

class JsonCleaner():  

    def __init__(self):        
        return

    def CleanGeoJson(self, geoJsonResponses, geoJsonToFill):
        
        for response in geoJsonResponses:
            responseObj = json.loads(response)
            for feature in responseObj['features']: 
                score = 1
                responseSchemaTemplate = "{\"type\": \"Feature\", \"geometry\": {}, \"properties\": { \"latitude\": {}, \"longitude\": {}, \"score\": {} }}"
                cleanFeature = json.loads(responseSchemaTemplate)
                
                cleanFeature['geometry'] = feature['geometry']
                cleanFeature['properties']['latitude'] = feature['properties']['latitude']
                cleanFeature['properties']['longitude'] = feature['properties']['longitude']
                cleanFeature['properties']['score'] = str(score)
                geoJsonToFill['features'].append(cleanFeature)
        return geoJsonToFill