from DataAggregator import DataAggregator

aggregator = DataAggregator()

#boundingBox = ((47.606359, -122.325458), (47.623644, -122.293172))
boundingBox = ((47.636030, -122.365352), (47.578296, -122.288318))
knobs = { "Accessibility": 0.5, "Safety": 1, "Nature": 0.2, "Toilets": 0.1 }
data = aggregator.GetAllCleanData("", boundingBox, knobs)

print(data)