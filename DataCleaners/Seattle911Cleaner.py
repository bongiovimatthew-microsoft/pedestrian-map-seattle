import json
from datetime import datetime, timedelta

from .ICleaner import ICleaner
from .HttpRequestManager import HttpRequestManager
from .JsonCleaner import JsonCleaner

from datetime import datetime

from pprint import pprint as pp
import grequests


class Seattle911Cleaner(ICleaner):

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

        startDate = datetime.today() - timedelta(days=21)
        endDate = datetime.today() - timedelta(days=7)

        # TODO: Decide if cleaners should choose date range, or if we should use the date range passed in

        selected_initial_type_groups = ['ROAD RAGE', 'TRAFFIC RELATED CALLS', 'ASSAULTS', 'HAZARDS', 'PERSON DOWN/INJURY']

        whereClause1 = "initial_type_group in ('{}')".format("','".join(selected_initial_type_groups))
        whereClause2 = "at_scene_time between '{4}' and '{5}' AND within_box(incident_location, {0}, {1}, {2}, {3})".format(str(boundingBox[0][0]), str(boundingBox[0][1]), str(boundingBox[1][0]), str(boundingBox[1][1]), startDate.strftime("%Y-%m-%dT%H:%M:%S"), endDate.strftime("%Y-%m-%dT%H:%M:%S"))

        url = "https://data.seattle.gov/resource/pu5n-trf4.geojson"
        url += '?$where=' + whereClause1 + ' AND ' + whereClause2
        # headers = {'Content-Type': 'application/json'}

        return grequests.get(url=url)

    def CleanData(self, response):
        data = response.json()

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

        pp(geoJson)
        return geoJson

    # def QueryBackend(self, addedFilters):

    #     manager = HttpRequestManager("https://data.seattle.gov/resource/pu5n-trf4.geojson")

    #     filters = addedFilters

    #     # TODO: Fix headers to work with app token

    #     # TODO: Add paging to our query by default, so that we get all the results (we currently only get 1000)
    #     # https://dev.socrata.com/docs/paging.html

    #     addedHeaders = { "X-App-Token": "88CbAdhF0j6N1usyYmBDdtCMI" }
    #     addedHeaders = {}
    #     response = manager.post( addedQsParams = filters, addedHeaders = addedHeaders)

    #     return response
