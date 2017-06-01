import urllib, json
#from PyQt4.QtCore import *
import qgis
from qgis.core import *

# create memory layer
vl = QgsVectorLayer("LineString", "point_data", "memory")
pr = vl.dataProvider()

# add fields
pr.addAttributes([QgsField("_id", QVariant.Int),
                    QgsField("ROAD_TYPE",  QVariant.String),
                    QgsField("ORGANISATION", QVariant.String)])
vl.updateFields() # tell the vector layer to fetch changes from the provider

# download data and parse it
url = 'http://www.odaa.dk/api/action/datastore_search?resource_id=c3097987-c394-4092-ad1d-ad86a81dbf37'
response = urllib.urlopen(url)
data = json.loads(response.read())

# iterate points and add to layer
for point in data['result']['records']:
    linestring_feature = QgsFeature()
    point1 = QgsPoint(float(point['POINT_1_LNG']), float(point['POINT_1_LAT']))
    point2 = QgsPoint(float(point['POINT_2_LNG']), float(point['POINT_2_LAT']))
    linestring = QgsGeometry.fromPolyline([point1, point2]);
    linestring_feature.setGeometry(linestring)
    linestring_feature.setAttributes([point["_id"], point["ROAD_TYPE"], point["ORGANISATION"]])
    pr.addFeatures([linestring_feature])

# update layer's extent when new features have been added
vl.updateExtents()

# sdd layer to layers panel
QgsMapLayerRegistry.instance().addMapLayer(vl)