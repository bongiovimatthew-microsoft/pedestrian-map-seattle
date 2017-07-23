# Compile and run CityPulse

The backend for CityPulse is made up of two services:
* Django web app
* Node.js web app

## Route calculation endpoint (Django):

1. Install dependencies.

```pip install django```
```pip install django-cors-headers```

2. Run the web app.

```Python .\PedestrianMapSeattleWeb\manage.py runserver```

## Waypoint calculation endpoint (Node.js):

1. Install dependencies.

```Install node.js```

2. Run the web app.

```node .\calculationLayer\waypointCalculator_node.js```