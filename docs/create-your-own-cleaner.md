# Create your own cleaner

You might choose to create a new cleaner for one of the following reasons:
* You wish to create a new data knob for users to seek
* You wish to implement an existing data knob in a new city

It is recommended that you read [Backend architecture](backend-architecture.md) before starting to create your cleaner.

## ICleaner interface

All cleaners implement the ICleaner interface (currently located under ```/dataLayer/```).

You must implement the following methods:

1. ```GetRequest(self, dateRange, boundingBox)```

This method will return the grequest request object necessary for gathering the data from the data source API.

**Parameters:**
* ```dateRange``` &ndash; the timeframe for which to get data
* ```boundingBox``` &ndash; the physical area in which to get the data, specified as a tuple of tuples, as follows:
* ```boundingBox[0][0]``` &ndash; latitude of upper left corner of bounding box
* ```boundingBox[0][1]``` &ndash; longitude of upper left corner of bounding box
* ```boundingBox[1][0]``` &ndash; latitude of lower right corner of bounding box
* ```boundingBox[1][1]``` &ndash; longitude of lower right corner of bounding box

**Returns:**
Returns a grequest request object necessary for gathering the data from the data source API.


2. ```CleanData()```

**Returns:**
Returns a GeoJSON blob containing all data, cleaned, and weighted appropriately.

GeoJSON should be of the form:

```
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
```

### Naming convention
A new **ICleaner** implementation should follow the naming pattern:

```<city-cleaner-applies-to><short-identifier-of-data-knob>Cleaner.py```

### Update DataAggregator
After adding a new **ICleaner** implementation, you must update ```DataAggregator.py``` to include your new cleaner. You should update the ```self.allCleaners declaration in __init__(self)```.

### Test the cleaner
In addition to creating a new implementation of **ICleaner**, you should create a test file to perform basic query testing of your new cleaner.

### Handle API keys
Many data sources you use will require an API key for access. You should add your API key to the ```ApiKeyManager.py``` class under **/dataLayer/**.