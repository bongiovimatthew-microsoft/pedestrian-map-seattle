from Seattle911Cleaner import Seattle911Cleaner
from DataAggregator import DataAggregator

# cleaner = Seattle911Cleaner()
# cleaner.QueryBackend(filters)

aggregator = DataAggregator()

dateRange = ""
boundingBox = ((47.606359, -122.325458), (47.623644, -122.293172))
knobWeights = {
                "Safety": 1
              }

aggregator.GetAllCleanData(dateRange, boundingBox, knobWeights)




