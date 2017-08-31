#
# Generate a GeoJSON path from a set of nodes in the given graph
#
# Parameters: 
#   path - a set of edge IDs 
#   graph - the graph with the full node context 
# 
# Return: 
#   A GeoJSON blob for the path 
#
def getGeoJsonFromPath(path, graph):
    node_features = []
    all_coords = []

    for pathnode in path:
        for node, data in graph.nodes_iter(data=True):  
            if node == pathnode: 
                node_features.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [data['x'], data['y']]}}) #long, lat
                all_coords.append([data['x'], data['y']])
                break
    geoJson = {"type": "FeatureCollection", "features": node_features }
    geoJsonLine = {
        "type": "FeatureCollection",
        "features": 
        [
            {
                "type": "Feature",
                "geometry": 
                {
                    "type": "LineString", 
                    "coordinates": all_coords
                }
            }
        ]
    }

    return geoJsonLine

#
# Generate a GeoJSON feature collection for all edges with total_cost
#
# Parameters: 
#   graph - the graph with the full node context 
# 
# Return: 
#   A GeoJSON blob for all the edges 
#
def getGeoJsonForAllEdges(graph):
    edgeDictArray = []

    for edge in graph.edges_iter(data=True, keys=True):
        edgeEntry = {
                "type": "Feature",
                "geometry": 
                {
                    "type": "LineString", 
                    "coordinates": [
                        [graph.node[edge[0]]['x'], graph.node[edge[0]]['y']],
                        [graph.node[edge[1]]['x'], graph.node[edge[1]]['y']]
                    ]
                },
                "properties": {
                    "total_cost": edge[3]['total_cost']
                }
            }

        edgeDictArray.append(edgeEntry)

    geoJsonAllEdges = {
        "type": "FeatureCollection",
        "features": edgeDictArray
    }

    return geoJsonAllEdges
