import json
from datetime import datetime, timedelta

from .ICleaner import ICleaner
from .HttpRequestManager import HttpRequestManager
from .JsonCleaner import JsonCleaner

class SeattleAccessibilityCleaner(ICleaner):  

    def __init__(self):
        ICleaner.__init__(self)
        return

    #
    # This method will return the cleaned data for the Seattle911 data store 
    # Params: 
    #    dateRange - the timeframe for which to get data 
    #    boundingBox - the physical area in which to get the data, specified as a tuple of tuples, as follows:
    #           boundingBox[0][0] - latitude of upper left corner of bounding box 
    #           boundingBox[0][1] - longitude of upper left corner of bounding box 
    #           boundingBox[1][0] - latitude of lower right corner of bounding box 
    #           boundingBox[1][1] - longitude of lower right corner of bounding box 
    # Returns: 
    #    GeoJSON blob containing all data, cleaned, and weighted appropriately 
    def GetData(self, dateRange, boundingBox):
        
        responseGeoJsonTemplate = "{\"type\" : \"FeatureCollection\", \"features\": []}"
        responseGeoJson = json.loads(responseGeoJsonTemplate)
        responses = []
        
        # TODO: Decide if cleaners should choose date range, or if we should use the date range passed in 
        
        whereClause = "within_box(shape, {0}, {1}, {2}, {3})".format(str(boundingBox[0][0]), str(boundingBox[0][1]), str(boundingBox[1][0]), str(boundingBox[1][1]))
        allFilters = []
        allFilters.append({ "category": "SINGLE", "$where": whereClause })
        allFilters.append({ "category": "SHARED", "$where": whereClause })
        
        for filter in allFilters:
            responses.append(self.QueryBackend(filter))

        # TODO: Handle JSON parsing exceptions  
        # TODO: Move JSON handling out to JsonCleaner
        for res in responses:
            responseObj = json.loads(res)
            for obj in responseObj:
                score = 1
                if(obj['condition'] == "POOR"):
                    score = 0.7
                
                responseSchemaTemplate = "{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": []}, \"properties\": { \"latitude\": {}, \"longitude\": {}, \"score\": {} }}"
                cleanFeature = json.loads(responseSchemaTemplate)
                    
                cleanFeature['geometry']['coordinates'].append(obj['shape']['longitude'])
                cleanFeature['geometry']['coordinates'].append(obj['shape']['latitude'])
                cleanFeature['properties']['latitude'] = obj['shape']['latitude']
                cleanFeature['properties']['longitude'] = obj['shape']['longitude']
                cleanFeature['properties']['score'] = str(score)
                
                responseGeoJson['features'].append(cleanFeature)

        return responseGeoJson
        
        
    def QueryBackend(self, addedFilters):
                
        manager = HttpRequestManager("https://data.seattle.gov/resource/j3nx-ir4y.json")
        
        filters = addedFilters
        
        # TODO: Fix headers to work with app token 
        
        # TODO: Add paging to our query by default, so that we get all the results (we currently only get 1000)
        # https://dev.socrata.com/docs/paging.html
        
        addedHeaders = { "X-App-Token": "88CbAdhF0j6N1usyYmBDdtCMI" }
        addedHeaders = {}
        response = manager.post( addedQsParams = filters, addedHeaders = addedHeaders)
        
        return response