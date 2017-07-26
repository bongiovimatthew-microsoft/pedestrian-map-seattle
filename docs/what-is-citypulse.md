# What is CityPulse?

CityPulse provides customized walking routes to every pedestrian by connecting users to the most up-to-date, relevant data their city has to offer.

Our application allows a user to generate a pedestrian route that fits user-defined priorities, such as safety, accessibility, air quality, pet friendliness, and many others. The application gives freedom to all pedestrians, especially those who are underserved by existing map applications.

The backend is made of two core services, one built with python as a django application, and the other built as a node.js service. We leverage mapbox + turf.js, along with Bing maps for the various GIS operations required to generate routes.