from ICleaner import ICleaner

class DataAggregator():
    def __init__(self):
        allCleaners = ['Seattle911Cleaner', 'SeattleAccessibilityCleaner']
        return
    
    #
    # This method is called by the Route Calculator as the single 'get data' call. 
    # Params: 
    #    dateRange - the timeframe for which to get data 
    #    boundingBox - the physical area in which to get the data 
    #    dataCleaners - a list of data cleaners to pull data from 
    # Returns: 
    #    GeoJSON blob containing all data, weighted appropriately 
    def GetAllCleanData(self, dateRange, boundingBox, dataCleaners): 
        dataCleaners = self.allCleaners
        allGeoJson = null
        # TODO: need to figure out how to combine all GEOJson 'features'
        
        #{
        #"type": "FeatureCollection",
        #"features": [
        #{ "type": "Feature", "properties": { "Primary ID": "1.26", "Secondary ID": "7km NE of Lake Arrowhead, California" }, "geometry": { "type": "Point", "coordinates": [ -117.1413333, 34.297 ] } },
        #{ "type": "Feature", "properties": { "Primary ID": "1.87", "Secondary ID": "13km NNE of Pahala, Hawaii" }, "geometry": { "type": "Point", "coordinates": [ -155.434494, 19.3199997 ] } },

        for cleaner in dataCleaners:
            allGeoJson += cleaner.GetData(dateRange, boundingBox)
        
        return allGeoJson