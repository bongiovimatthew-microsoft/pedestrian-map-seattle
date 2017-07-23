Compiling and Running CityPulse:

The back-end for CityPulse is made up of two services, a django web app, and a node.js web app.

Route Calculation Endpoint (django):

Install dependencies:
pip install django
pip install django-cors-headers

Run the web app:
Python .\PedestrianMapSeattleWeb\manage.py runserver

Waypoint Calculation Endpoint (node.js):

Install dependencies:
Install node.js

Run the web app:
node .\calculationLayer\waypointCalculator_node.js