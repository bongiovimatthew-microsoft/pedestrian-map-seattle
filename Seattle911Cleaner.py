from ICleaner import ICleaner
from HttpRequestManager import HttpRequestManager

class Seattle911Cleaner(ICleaner):  

    def __init__(self):
        ICleaner.__init__(self)
        return

    def GetData(self, dateRange, boundingBox):
    
        return
        
    def QueryBackend(self):
                
        manager = HttpRequestManager("https://data.seattle.gov/resource/pu5n-trf4.geojson")
        
        filters = { "initial_type_group": "ROAD RAGE", "$where": "at_scene_time between '2017-05-15T20:00:00' and '2017-05-24T23:00:00'" }
        addedHeaders = { "X-App-Token": "88CbAdhF0j6N1usyYmBDdtCMI" }
        addedHeaders = {}
        response = manager.post( addedQsParams = filters, addedHeaders = addedHeaders)
                
        print(response)
        return