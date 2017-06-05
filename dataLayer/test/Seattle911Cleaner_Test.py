from dataLayer import Seattle911Cleaner

cleaner = Seattle911Cleaner()

boundingBox = ((47.606359, -122.325458), (47.623644, -122.293172))
cleaner.GetData(dateRange, boundingBox)