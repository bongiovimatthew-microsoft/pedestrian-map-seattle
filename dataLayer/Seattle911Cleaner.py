from ICleaner import ICleaner
from HttpRequestManager import HttpRequestManager

class Seattle911Cleaner(ICleaner):  

    def __init__(self):
        ICleaner.__init__(self)
        return

    def GetData(self, dateRange, boundingBox):
        
        # boundingBox = ((47.606359, -122.325458), (47.623644, -122.293172))
        
        # Query for each 'initial_type_group' as a separate query, and then aggregate them into a single GEOJSON response 

        # Get ROAD RAGE events 
        whereClause = "at_scene_time between '2017-05-05T20:00:00' and '2017-06-07T23:00:00' AND within_box(incident_location, {0}, {1}, {2}, {3})".format(str(boundingBox[0][0]), str(boundingBox[0][1]), str(boundingBox[1][0]), str(boundingBox[1][1]))
        filters = { "initial_type_group": "ROAD RAGE", "$where": whereClause }
        self.QueryBackend(filters)
        
        
        
        # Get DUI events 
        filters = { "initial_type_group": "<ADD DUI MARKER HERE>", "$where": "at_scene_time between '2017-05-15T20:00:00' and '2017-05-24T23:00:00' AND within_box(incident_location, 47.606359, -122.325458, 47.623644, -122.293172)" }
        
        
        return
        
        
    def QueryBackend(self, addedFilters):
                
        manager = HttpRequestManager("https://data.seattle.gov/resource/pu5n-trf4.geojson")
        
        #filters = { "initial_type_group": "ROAD RAGE", "$where": "at_scene_time between '2017-05-15T20:00:00' and '2017-05-24T23:00:00'" }
        filters = addedFilters
        
        addedHeaders = { "X-App-Token": "88CbAdhF0j6N1usyYmBDdtCMI" }
        addedHeaders = {}
        response = manager.post( addedQsParams = filters, addedHeaders = addedHeaders)
                
        print(response)
        return response 