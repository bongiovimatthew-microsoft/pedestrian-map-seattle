// API Key 
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9uZ2lvdmltYXR0aGV3IiwiYSI6ImNqMzU1NXlpYzAyMmwzMm5ya2tuYjNuMWMifQ.cxVuCXpkeTawreTAcEnNnQ';


// Define the map object for route calculation. We set the center and zoom to focus on Seattle.
//  However, the true implementation can use default style and center, as nobody will see the map UI
//   (we may be able to remvoe the "container" element below, which will allow us to remove the div from the HTMl as well)
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-122.332433, 47.606003],
    zoom: 12
});

// Define the points to be analyzed 
var points = {'type':'FeatureCollection','features':[{'properties':{'latitude':'47.615568','longitude':'-122.315096','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.315096,47.615568]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614945','longitude':'-122.317119','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.317119,47.614945]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616492','longitude':'-122.318952','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.318952,47.616492]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.610653','longitude':'-122.317111','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.317111,47.610653]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61806','longitude':'-122.30883','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30883,47.61806]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616768','longitude':'-122.321353','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.321353,47.616768]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.618027','longitude':'-122.311823','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.311823,47.618027]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617859','longitude':'-122.310516','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310516,47.617859]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617361','longitude':'-122.310517','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310517,47.617361]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616957','longitude':'-122.315182','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.315182,47.616957]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614926','longitude':'-122.313852','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.313852,47.614926]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.613183','longitude':'-122.32175','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.32175,47.613183]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.612262','longitude':'-122.322088','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.322088,47.612262]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617756','longitude':'-122.319136','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319136,47.617756]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.618565','longitude':'-122.321954','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.321954,47.618565]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617013','longitude':'-122.319134','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319134,47.617013]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614233','longitude':'-122.313032','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.313032,47.614233]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617309','longitude':'-122.300994','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.300994,47.617309]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.611801','longitude':'-122.3124','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.3124,47.611801]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.6131107170061','longitude':'-122.310543098826','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310543098826,47.6131107170061]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.613126','longitude':'-122.310569','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310569,47.613126]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61654','longitude':'-122.319302','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319302,47.61654]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.611881','longitude':'-122.312577','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.312577,47.611881]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61157','longitude':'-122.30013','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30013,47.61157]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617309','longitude':'-122.300993','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.300993,47.617309]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.615449','longitude':'-122.318367','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.318367,47.615449]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.612259','longitude':'-122.319318','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319318,47.612259]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.615313','longitude':'-122.311587','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.311587,47.615313]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61651','longitude':'-122.30839','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30839,47.61651]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61713','longitude':'-122.307','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.307,47.61713]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61393','longitude':'-122.31743','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.31743,47.61393]},'score':1,'icon':'monument'}]}

// Generate a TIN, using the "score" property as the Z value for the points 
var tin = turf.tin(points, 'score')

// Iterate through the TIN polygons, and calculate area and centroid for each 
for(i = 0; i < tin.features.length; i++){
    tin.features[i].properties.area = turf.area(tin.features[i])
    tin.features[i].properties.centroid = turf.centroid(tin.features[i])
}

// Define a compare function to compare TIN polygons by area, from largest to smallest 
function compare(a,b) {
  if (a.properties.area < b.properties.area)
    return 1;
  if (a.properties.area > b.properties.area)
    return -1;
  return 0;
}

// Sort the TIN by polygon area, from largest to smallest 
var sortedTin = tin.features.sort(compare); 

// Take the top 10 centroids and use them as waypoints 
var waypoints = []
var waypointObjs = []

for(i = 0; i < 20; i++){
    currCentroid = sortedTin[i].properties.centroid.geometry.coordinates
    changedCentroid = sortedTin[i].properties.centroid
    changedCentroid.properties.icon = "rocket"
    
    waypoints.push(currCentroid)
    waypointObjs.push(changedCentroid)
}

console.log(waypointObjs)
console.log(JSON.stringify(waypointObjs))

var waypoints = {'type': 'FeatureCollection', 'features': [{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30589103294199,47.6139369056687]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30270800000001,47.61533633333334]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30769103294199,47.61216057233537]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31570600000002,47.61215466666666]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30988033333331,47.611341333333336]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31461966666666,47.613578999999994]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31981166666667,47.61363033333333]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.313619,47.616636666666665]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31018200000001,47.614983]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.32080166666667,47.615497000000005]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31538033333334,47.61758]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.317953,47.61228066666666]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31763766666667,47.61811600000001]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31242066666668,47.61608866666666]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.305608,47.61749966666667]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31980633333335,47.61505733333333]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31205933333332,47.61308]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31016466666667,47.61639466666667]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31775666666665,47.61706833333333]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.32081433333333,47.617696333333335]}}]}

var knobWeights = {
                "Accessibility": 0.5,
                "Safety":        1,
                "Nature":        0.2,
                "Toilets":       0.1
              }

var jsonPost = {
                        "startLatitude"    : "47.636030",
                        "startLongitude"   : "-122.365352",
                        "endLatitude"      : "47.578296",
                        "endLongitude"     : "-122.288318",
                        "knobWeights"      : knobWeights
            }

var url = "http://127.0.0.1:8000/routeCalc/";
var xhttp = new XMLHttpRequest();
xhttp.open("POST", url, false);

xhttp.setRequestHeader("Content-type", "application/json");

xhttp.send(JSON.stringify(jsonPost));
console.log("Logging JSON Response");
// console.log(xhttp.responseText)
var response = JSON.parse(xhttp.responseText);
console.log(response);

map.on('load', function() {
    map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {'type':'FeatureCollection','features':[{'properties':{'latitude':'47.615568','longitude':'-122.315096','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.315096,47.615568]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614945','longitude':'-122.317119','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.317119,47.614945]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616492','longitude':'-122.318952','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.318952,47.616492]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.610653','longitude':'-122.317111','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.317111,47.610653]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61806','longitude':'-122.30883','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30883,47.61806]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616768','longitude':'-122.321353','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.321353,47.616768]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.618027','longitude':'-122.311823','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.311823,47.618027]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617859','longitude':'-122.310516','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310516,47.617859]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617361','longitude':'-122.310517','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310517,47.617361]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.616957','longitude':'-122.315182','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.315182,47.616957]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614926','longitude':'-122.313852','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.313852,47.614926]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.613183','longitude':'-122.32175','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.32175,47.613183]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.612262','longitude':'-122.322088','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.322088,47.612262]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617756','longitude':'-122.319136','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319136,47.617756]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.618565','longitude':'-122.321954','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.321954,47.618565]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617013','longitude':'-122.319134','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319134,47.617013]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.614233','longitude':'-122.313032','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.313032,47.614233]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617309','longitude':'-122.300994','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.300994,47.617309]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.611801','longitude':'-122.3124','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.3124,47.611801]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.6131107170061','longitude':'-122.310543098826','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310543098826,47.6131107170061]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.613126','longitude':'-122.310569','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.310569,47.613126]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61654','longitude':'-122.319302','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319302,47.61654]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.611881','longitude':'-122.312577','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.312577,47.611881]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61157','longitude':'-122.30013','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30013,47.61157]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.617309','longitude':'-122.300993','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.300993,47.617309]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.615449','longitude':'-122.318367','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.318367,47.615449]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.612259','longitude':'-122.319318','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.319318,47.612259]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.615313','longitude':'-122.311587','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.311587,47.615313]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61651','longitude':'-122.30839','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.30839,47.61651]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61713','longitude':'-122.307','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.307,47.61713]},'score':1,'icon':'monument'},{'properties':{'latitude':'47.61393','longitude':'-122.31743','score':'1','icon':'monument'},'type':'Feature','geometry':{'type':'Point','coordinates':[-122.31743,47.61393]},'score':1,'icon':'monument'}]}
            },
            "layout": {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });
        
    map.addLayer({
        "id": "waypoints",
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {'type': 'FeatureCollection', 'features': [{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30589103294199,47.6139369056687]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30270800000001,47.61533633333334]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30769103294199,47.61216057233537]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31570600000002,47.61215466666666]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.30988033333331,47.611341333333336]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31461966666666,47.613578999999994]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31981166666667,47.61363033333333]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.313619,47.616636666666665]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31018200000001,47.614983]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.32080166666667,47.615497000000005]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31538033333334,47.61758]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.317953,47.61228066666666]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31763766666667,47.61811600000001]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31242066666668,47.61608866666666]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.305608,47.61749966666667]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31980633333335,47.61505733333333]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31205933333332,47.61308]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31016466666667,47.61639466666667]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.31775666666665,47.61706833333333]}},{'type':'Feature','properties':{'icon':'rocket'},'geometry':{'type':'Point','coordinates':[-122.32081433333333,47.617696333333335]}}]}
        },
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });
});
