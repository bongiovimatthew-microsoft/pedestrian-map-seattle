// API Key 
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9uZ2lvdmltYXR0aGV3IiwiYSI6ImNqMzU1NXlpYzAyMmwzMm5ya2tuYjNuMWMifQ.cxVuCXpkeTawreTAcEnNnQ';


// Define the map object for route calculation. We set the center and zoom to focus on Seattle.
//  However, the true implementation can use default style and center, as nobody will see the map UI
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-122.332433, 47.606003],
    zoom: 12
});

map.on('load', function() {
    map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"icon":"monument"},"geometry":{"type":"Point","coordinates":[-122.33155,47.7241]}},{"type":"Feature","properties":{"icon":"monument"},"geometry":{"type":"Point","coordinates":[-122.269394,47.671185]}},{"type":"Feature","properties":{"icon":"monument"},"geometry":{"type":"Point","coordinates":[-122.33327,47.58504]}},{"type":"Feature","properties":{"icon":"monument"},"geometry":{"type":"Point","coordinates":[-122.36614,47.673077]}}]}
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