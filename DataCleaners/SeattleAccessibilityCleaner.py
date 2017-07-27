import json
from datetime import datetime, timedelta

from .ICleaner import ICleaner
from .HttpRequestManager import HttpRequestManager
from .JsonCleaner import JsonCleaner

import grequests

from pprint import pprint as pp


class SeattleAccessibilityCleaner(ICleaner):

    def __init__(self):
        ICleaner.__init__(self)
        return

    #
    # This method will return the cleaned data for the Seattle911 data store
    # Params:
    #    dateRange - the timeframe for which to get data
    #    boundingBox - the physical area in which to get the data, specified as a tuple of tuples, as follows:
    #           boundingBox[0][0] - latitude of upper left corner of bounding box
    #           boundingBox[0][1] - longitude of upper left corner of bounding box
    #           boundingBox[1][0] - latitude of lower right corner of bounding box
    #           boundingBox[1][1] - longitude of lower right corner of bounding box
    # Returns:
    #    GeoJSON blob containing all data, cleaned, and weighted appropriately
    def GetRequest(self, dateRange, boundingBox):
        # THIS ENDPOINT DOESNT SUPPORT #IN ;(
        whereClause1 = "(category = 'SINGLE' OR category = 'SHARED')"
        whereClause2 = "within_box(shape, {0}, {1}, {2}, {3})".format(str(boundingBox[0][0]), str(boundingBox[0][1]), str(boundingBox[1][0]), str(boundingBox[1][1]))

        url = "https://data.seattle.gov/resource/j3nx-ir4y.json"
        url += '?$where=' + whereClause1 + ' AND ' + whereClause2 + '&$limit=50000'

        headers = {'Content-Type': 'application/json'}

        return grequests.get(url=url, headers=headers)

    def CleanData(self, response):
        data = response.json()

        # pp(data)

        geoJson = {"type"     : "FeatureCollection",
                   "features" : []}

        for feature in data:
            score = 1
            if(feature['condition'] == "POOR"):
                score = 0.7

            featJson = {"type"       : "Feature",
                        "geometry"   : {
                                            "type"        : "Point",
                                            "coordinates" : [],

                                        },
                        "properties" : {
                                            "latitude"  : {},
                                            "longitude" : {},
                                            "score"     : {},
                                        }
                        }

            # responseSchemaTemplate = "{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": []}, \"properties\": { \"latitude\": {}, \"longitude\": {}, \"score\": {} }}"
            # cleanFeature = json.loads(responseSchemaTemplate)

            featJson['geometry']['coordinates'].append(feature['shape']['longitude'])
            featJson['geometry']['coordinates'].append(feature['shape']['latitude'])
            featJson['properties']['latitude'] = feature['shape']['latitude']
            featJson['properties']['longitude'] = feature['shape']['longitude']
            featJson['properties']['score'] = str(score)

            geoJson['features'].append(featJson)

        return geoJson

    # def QueryBackend(self, addedFilters):

    #     manager = HttpRequestManager("https://data.seattle.gov/resource/j3nx-ir4y.json")

    #     filters = addedFilters

    #     # TODO: Fix headers to work with app token

    #     # TODO: Add paging to our query by default, so that we get all the results (we currently only get 1000)
    #     # https://dev.socrata.com/docs/paging.html

    #     addedHeaders = { "X-App-Token": "88CbAdhF0j6N1usyYmBDdtCMI" }
    #     addedHeaders = {}
    #     response = manager.post( addedQsParams = filters, addedHeaders = addedHeaders)

    #     return response
