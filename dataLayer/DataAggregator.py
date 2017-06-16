from ICleaner import ICleaner
from Seattle911Cleaner import Seattle911Cleaner
from SeattleAccessibilityCleaner import SeattleAccessibilityCleaner
from SeattleNatureCleaner import SeattleNatureCleaner
from SeattlePublicToiletsCleaner import SeattlePublicToiletsCleaner

class DataAggregator():

    def __init__(self):
        
        # TODO-manigu-06112017 We will have to move this to an xml file or something later
        #  right now it's a list of tupples, where 0 is the data set name, 1 is knob it affects
        #  2 is the weight of that set wrt to the knob, bounding box for data set?
        self.allCleaners = [
        ('Seattle911Cleaner', 'Safety', 1),
        ('SeattleAccessibilityCleaner', 'Accessibility', 1),
        ('SeattleNatureCleaner', 'Nature', 1),
        ('SeattlePublicToiletsCleaner', 'Toilets', 1)
        ]
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
        allGeoJson = []

        # TODO-manigu-06112017 figure out data cleaners from the bounding box

        # TODO: Call each cleaner in a separate thread 
        for cleaner in self.allCleaners:
            cleanerName = eval(cleaner[0])()
            cleanerData = cleanerName.GetData(dateRange, boundingBox)
            cleanerPoints = cleanerData["features"]
            for point in cleanerPoints:
                # Default to a 1 if weight is not in the point
                if "score" not in point.keys():
                    point['score'] = 1

                # Scale point weight by weight of data wrt to a knob
                point['score'] *= cleaner[2]

                # Scale point weight by weight of knob for this call
                # issue-manigu-06112017 what should we do in the case that we dont have this passed to us?
                if cleaner[1] not in knobWeights.keys():
                    point['score'] *= knobWeights[cleaner[1]]

        allGeoJson.append(cleanerData)

        return allGeoJson