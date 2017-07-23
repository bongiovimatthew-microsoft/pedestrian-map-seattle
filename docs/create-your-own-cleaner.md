Creating Your Own Cleaner:

You should create a new cleaner for one of the following reasons:
You wish to create a new data knob for users to seek
You wish to implement an existing data knob in a new city

It is recommended that you read the “Back-End Architecture” section <link> before creating a new cleaner

The ICleaner interface:

All cleaners implement the ICleaner interface (currently located under /dataLayer/).

You must implement the following methods:

GetData(self, dateRange, boundingBox)



#


  # This method will return the cleaned data for the Seattle911 data store

  # Params:

  #    dateRange - the timeframe for which to get data

  #    boundingBox - the physical area in which to get the data, specified as a tuple of tuples, as follows:

  #           boundingBox[0][0] - latitude of upper left corner of bounding box

  #           boundingBox[0][1] - longitude of upper left corner of bounding box

  #           boundingBox[1][0] - latitude of lower right corner of bounding box

  #           boundingBox[1][1] - longitude of lower right corner of bounding box

  # Returns:

  #    GeoJSON blob containing all data, cleaned, and weighted appropriately

GeoJSON should be of the form:
{
        'type': 'FeatureCollection',
        'features': [{
                'properties': {
                    'latitude': '47.615568',
                    'longitude': '-122.315096',
                    'score': '1'
                },
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-122.315096, 47.615568]
                },
                'score': 1
            }, {
                'properties': {
                    'latitude': '47.614945',
                    'longitude': '-122.317119',
                    'score': '1'
                },
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-122.317119, 47.614945]
                },
                'score': 1
            }        ]
    }



DataBoundary()
Returns: GeoJSON blob containing the bounding area in which the data for this cleaner is applicable

When possible, you should utilize HttpRequestManager.py to make requests to a data source API.

Naming Convention:

A new ICleaner implementation should follow the naming pattern:
<City your cleaner applies to><Simple 1-3 word identifier of data knob>Cleaner.py

Updating DataAggregator:

After adding a new ICleaner implementation, you must update DataAggregator.py to include your new cleaner. You should update the self.allCleaners declaration in __init__(self).

Cleaner testing:

In addition to creating a new implementation of ICleaner, you should create a test file to perform basic query testing of your new cleaner.

Handling API Paging:

Many data sources perform request paging if the data being returned is too large. Your cleaner should handle this paging, and return a single GeoJSON blob from GetData().

Handling API Keys:

Many data sources you use will require an API key for access. You should add your API key to the ApiKeyManager.py class under /dataLayer/.