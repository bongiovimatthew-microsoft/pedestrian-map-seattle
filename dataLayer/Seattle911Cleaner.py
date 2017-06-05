from ICleaner import ICleaner
from HttpRequestManager import HttpRequestManager

class Seattle911Cleaner(ICleaner):  

    def __init__(self):
        ICleaner.__init__(self)
        return

    def GetData(self, dateRange, boundingBox):
        # Create filters from boundingBox 
        # TODO: box should turn to query  
        # boundingBox = ((47.606359, -122.325458), (47.623644, -122.293172))
        # $where=longitude > -122.325458
        # $where=longitude < -122.293172
        # $where=latitude < 47.623644
        # $where=latitude > 47.606359
        
        latitudes = [boundingBox[0][0], boundingBox[1][0]]
        longitudes = [boundingBox[0][1], boundingBox[1][1]]
        
        filterAnds = [str("latitude < " + str(max(latitudes))), str("latitude > " + str(min(latitudes))), str("longitude < " + str(max(longitudes))), str("longitude > " + str(min(longitudes)))]
        
        for filter in filterAnds:
            print(filter)
            
        return
        
        
    def QueryBackend(self):
                
        manager = HttpRequestManager("https://data.seattle.gov/resource/pu5n-trf4.geojson")
        
        filters = { "initial_type_group": "ROAD RAGE", "$where": "at_scene_time between '2017-05-15T20:00:00' and '2017-05-24T23:00:00'" }
        addedHeaders = { "X-App-Token": "88CbAdhF0j6N1usyYmBDdtCMI" }
        addedHeaders = {}
        response = manager.post( addedQsParams = filters, addedHeaders = addedHeaders)
                
        print(response)
        return