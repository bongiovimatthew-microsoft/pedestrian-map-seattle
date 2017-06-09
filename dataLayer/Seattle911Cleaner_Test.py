from Seattle911Cleaner import Seattle911Cleaner

cleaner = Seattle911Cleaner()

#boundingBox = ((47.606359, -122.325458), (47.623644, -122.293172))
boundingBox = ((47.636030, -122.365352), (47.578296, -122.288318))
cleaner.GetData("", boundingBox)