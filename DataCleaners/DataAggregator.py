import jsonschema
import os
import json

from .Seattle911Cleaner import Seattle911Cleaner
from .SeattleAccessibilityCleaner import SeattleAccessibilityCleaner
from .SeattleNatureCleaner import SeattleNatureCleaner
from .SeattlePublicToiletsCleaner import SeattlePublicToiletsCleaner


# Create the schema, as a nested Python dict, 
# specifying the data elements, their names and their types.
schema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "Root XML",
    "type": "object",
    "required": ["cleaners"],
    "properties": {
        "cleaners": {
            "type" : "array",
            "description": "All cleaners accessible",
            "minItems": 1,
            "uniqueItems": True,
            "items": {
                "title": "Cleaner",
                "type": "object",
                "properties" : {
                    "name" : {
                        "type" : "string",
                        "description": "Cleaner name that matches the python script name"
                    },
                    "knob" : {
                        "type" : "string",
                        "description": "Knob that the cleaner applies to"
                    },
                    "weight" : {
                        "type" : "number",
                        "description": "Weight of data set with respect to the knob"
                    },
                    "boundingBox" : {
                        "type" : "object",
                        "description": "Bounding box within which the cleaner should be used (rectangular)",
                        "properties": {
                            "startLatitude": {
                                "type": "number",
                                "description": "The top left latitude of the box"
                            },
                            "startLongitude": {
                                "type": "number",
                                "description": "The top left longitude of the box"
                            },
                            "endLatitude": {
                                "type": "number",
                                "description": "The bottom right latitude of the box"
                            },
                            "endLongitude": {
                                "type": "number",
                                "description": "The bottom right longitude of the box"
                            },
                        },
                        "required": ["startLatitude", "startLongitude", "endLatitude", "endLongitude"]
                    },
                    "effectiveRadius" : {
                        "type" : "number",
                        "description": "The radius within which points in a datset apply"
                    },
                },
                "required": ["name", "knob", "weight", "boundingBox", "effectiveRadius"]
            }
        }
    }
}


class DataAggregator():
    def __init__(self):
        DATA_CLEANERS_JSON_FILENAME = os.path.join(os.path.dirname(os.path.realpath(__file__)), "dataCleaners.json")
        print(DATA_CLEANERS_JSON_FILENAME)

        dataCleanersFileHandle = open(DATA_CLEANERS_JSON_FILENAME, 'r') 
        dataCleanersFileText = dataCleanersFileHandle.read() 
        dataCleanersFileJson = json.loads(dataCleanersFileText)

        print("Raw input cleaner data:")
        print(dataCleanersFileJson)

        print("Pretty-printed input data:")
        print(json.dumps(dataCleanersFileJson, indent=4))
        print("Validating the input data cleaners using jsonschema:")
        try:
            jsonschema.validate(dataCleanersFileJson, schema)
            print("Validated {0}\n".format(DATA_CLEANERS_JSON_FILENAME))
        except jsonschema.exceptions.ValidationError as ve:
            print("Failed to validate #{}: ERROR\n".format(DATA_CLEANERS_JSON_FILENAME))
            print(str(ve) + "\n")
            raise ve

        # TODO-manigu-06112017 We will have to move this to an xml file or something later
        #  right now it's a list of tupples, where 0 is the data set name, 1 is knob it affects
        #  2 is the weight of that set wrt to the knob, bounding box for data set?
        self.allCleaners = dataCleanersFileJson["cleaners"]
        return
    
    #
    # This method is called by the Route Calculator as the single 'get data' call. 
    # Params: 
    #    dateRange - the timeframe for which to get data 
    #    boundingBox - the physical area in which to get the data 
    #    knobWeights - a dictionary of knob names to the weights 
    # Returns: 
    #    GeoJSON blob containing all data, weighted appropriately 
    def GetAllCleanData(self, dateRange, boundingBox, knobWeights): 
        allGeoJson = {'type': 'FeatureCollection', 'features': []}

        # TODO-manigu-06112017 figure out data cleaners from the bounding box

        # TODO: Call each cleaner in a separate thread 
        for cleaner in self.allCleaners:
            
            # Don't call the cleaners we know we won't need 
            if cleaner["knob"] not in knobWeights.keys():
                continue

            if knobWeights[cleaner["knob"]] == 0:
                continue
            
            cleanerName = eval(cleaner["name"])()
            cleanerData = cleanerName.GetData(dateRange, boundingBox)
            cleanerPoints = cleanerData["features"]
            for point in cleanerPoints:
                # Ensure that all coordinates are floats (and not strings)
                tempCoords = []
                for coordinate in point['geometry']['coordinates']:
                    tempCoords.append(float(coordinate))
                point['geometry']['coordinates'] = tempCoords
                
                # Default to a 1 if weight is not in the point
                if 'score' not in point['properties'].keys():
                    point['properties']['score'] = 1

                # Scale point weight by weight of data wrt to a knob
                point['properties']['score'] = float(point['properties']['score']) * cleaner["weight"]

                point['properties']['knob'] = cleaner["knob"] 

                # Scale point weight by weight of knob for this call
                # issue-manigu-06112017 what should we do in the case that we dont have this passed to us?
                if cleaner["knob"] in knobWeights.keys():
                    point['properties']['score'] *= knobWeights[cleaner["knob"]]

            allGeoJson['features'] = allGeoJson['features'] + cleanerPoints

        return allGeoJson