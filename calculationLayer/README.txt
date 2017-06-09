Calculation Orchestration:


1. User enters route source and destination, and knobs 
2. Front end makes a call to a backend orchestrator, providing the source and destination, and knobs 
3. Orchestrator calls DataAggregator after generating bounding box, which aggregates the correct data from the correct area. Generates a data.json file for the current request 
4. Orchestrator uses waypointJsGenerator.py to consume the data blob, and waypointCalculator_template to generate the waypointCalculator.js, a server-side JS application for calculating the route
5. Orchestrator executes the waypointCalculator.js application (by making an HTTP request to the temporary endpoint set up for this request), which will return a set of waypoints 
6. Orchestrator makes request to Bing maps, Google maps, etc. with the waypoints to get a route through those waypoints 
7. Orchestrator returns route object to front-end application for display and navigation 
8. Front-end displays route 