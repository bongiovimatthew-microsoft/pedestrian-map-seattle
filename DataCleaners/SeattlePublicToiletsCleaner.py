import json
from datetime import datetime, timedelta

from .ICleaner import ICleaner
from .HttpRequestManager import HttpRequestManager
from .JsonCleaner import JsonCleaner

import grequests

from pprint import pprint as pp


class SeattlePublicToiletsCleaner(ICleaner):

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
    #    grequest
    def GetRequest(self, dateRange, boundingBox):
        whereClause1 = "(city_feature='Public Toilets')"
        whereClause2 = "within_box(location, {0}, {1}, {2}, {3})".format(str(boundingBox[0][0]), str(boundingBox[0][1]), str(boundingBox[1][0]), str(boundingBox[1][1]))

        url = "https://data.seattle.gov/resource/3c4b-gdxv.geojson"
        url += '?$where=' + whereClause1 + ' AND ' + whereClause2

        return grequests.get(url=url)

    def CleanData(self, response):
        data = response.json()
        pp(data)
        geoJson = {"type"     : "FeatureCollection",
                   "features" : []}

        for feature in data['features']:
            score = 1
            featJson = {"type"       : "Feature",
                        "geometry"   : {},
                        "properties" : {
                                            "latitude"  : {},
                                            "longitude" : {},
                                            "score"     : {},
                                        }
                        }

            featJson['geometry'] = feature['geometry']
            featJson['properties']['latitude'] = feature['properties']['latitude']
            featJson['properties']['longitude'] = feature['properties']['longitude']
            featJson['properties']['score'] = str(score)
            geoJson['features'].append(featJson)

        return geoJson
