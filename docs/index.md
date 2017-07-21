What is CityPulse
How CityPulse Works
How to Contribute 
Compiling and Running CityPulse
Back-end architecture 
Creating your own cleaner 
    ICleaner interface
    Cleaner testing    
    Handling API Paging 
    Handling API keys 
    Updating DataAggregator
Data Review Process for new cleaners 
    Cleaner definition 
    SLA requirements 
    Timing requirements 
    Code review 
Current Data Knob Definitions 


What is CityPulse?

CityPulse provides customized walking routes to every pedestrian by connecting users to the most up-to-date, relevant data their city has to offer.

Our application allows a user to generate a pedestrian route that fits user-defined priorities, such as safety, accessibility, air quality, pet friendliness, and many others. The application gives freedom to all pedestrians, especially those who are underserved by existing map applications. 

The backend is made of two core services, one built with python as a django application, and the other built as a node.js service. We leverage mapbox + turf.js, along with Bing maps for the various GIS operations required to generate routes. 

How CityPulse Works: 

CityPulse uses live data, provided by your city, to generate walking routes. CityPulse presents a user with a set of “data knobs”, which each correspond to one or more data sources. A data knob is a feature which the user seeks in their walking route, for example, “clean air” or “pet friendliness”. For a full list of existing data knobs, see the “Current Data Knob Definitions” section <link>.  

Users select data knobs for their route, and then sets a priority of the set they have chosen. This data is then used to determine how best to get the user from point A to point B, while maximizing their exposure to the data features they chose. 

How to Contribute: 

Those wishing to contribute to CityPulse can do so in three main ways: 
Add more data knobs to Seattle - different pedestrians want different things from their city. If you know of a good dataset, see the “Creating Your Own Cleaner” section <link> to add a cleaner. 
Add data knobs for new cities - CityPulse is looking to expand beyond Seattle. In order to do that, we need developers to add cleaners based on live, local city data. See the “Creating Your Own Cleaner” section <link> to add a cleaner. 
Fix bugs! - we have an always growing list of bugs to be tackled. If you come across an issue, feel free to fork us and send a pull request! 

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


Back-End Architecture: 

<Todo: finish this section> 


Creating Your Own Cleaner:

You should create a new cleaner for one of the following reasons: 
You wish to create a new data knob for users to seek 
You wish to implement an existing data knob in a new city 

It is recommended that you read the “Back-End Architecture” section <link> before creating a new cleaner 

The ICleaner interface: 

All cleaners implement the ICleaner interface (currently located under /dataLayer/). 

You must implement the following methods: 

GetData(self, dateRange, boundingBox)



#


  # This method will return the cleaned data for the Seattle911 data store

  # Params:

  #    dateRange - the timeframe for which to get data

  #    boundingBox - the physical area in which to get the data, specified as a tuple of tuples, as follows:

  #           boundingBox[0][0] - latitude of upper left corner of bounding box

  #           boundingBox[0][1] - longitude of upper left corner of bounding box

  #           boundingBox[1][0] - latitude of lower right corner of bounding box

  #           boundingBox[1][1] - longitude of lower right corner of bounding box

  # Returns:

  #    GeoJSON blob containing all data, cleaned, and weighted appropriately

GeoJSON should be of the form: 
{
        'type': 'FeatureCollection',
        'features': [{
                'properties': {
                    'latitude': '47.615568',
                    'longitude': '-122.315096',
                    'score': '1'
                },
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-122.315096, 47.615568]
                },
                'score': 1
            }, {
                'properties': {
                    'latitude': '47.614945',
                    'longitude': '-122.317119',
                    'score': '1'
                },
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-122.317119, 47.614945]
                },
                'score': 1
            }        ]
    }



DataBoundary()
Returns: GeoJSON blob containing the bounding area in which the data for this cleaner is applicable 

When possible, you should utilize HttpRequestManager.py to make requests to a data source API.

Naming Convention: 

A new ICleaner implementation should follow the naming pattern:
<City your cleaner applies to><Simple 1-3 word identifier of data knob>Cleaner.py

Updating DataAggregator:

After adding a new ICleaner implementation, you must update DataAggregator.py to include your new cleaner. You should update the self.allCleaners declaration in __init__(self). 

Cleaner testing:

In addition to creating a new implementation of ICleaner, you should create a test file to perform basic query testing of your new cleaner. 

Handling API Paging:

Many data sources perform request paging if the data being returned is too large. Your cleaner should handle this paging, and return a single GeoJSON blob from GetData().

Handling API Keys:

Many data sources you use will require an API key for access. You should add your API key to the ApiKeyManager.py class under /dataLayer/. 


Data Review Process for New Cleaners: 

When you send us a pull request containing new data cleaners, we will perform the following review, in which we will ask you to provide a small amount of testing and documentation. 

Code review - a standard review of the changes you are making 
Cleaner definition - If you are creating a new data knob (as opposed to implementing an existing knob in a new city), you must provide a definition of the data knob, to allow us to generate graphics and information bubbles for the user. 
Service Level Agreement (SLA) requirements - We will review the SLA of the data source which your cleaner leverages. We currently require a 99.9 % SLA.     
Timing requirements - A query sent to your cleaner for a bounding box of 300,000 square meters must take no more than 2 seconds to complete. 
API key re-registration - we will register for our own API key for any data source you utilize, and will update the review with our key. 


Current Data Knob Definitions: 

Below is a list of existing data knobs, and their meanings. 

Pedestrian Safety
Routes that look for “Pedestrian Safety” will look to avoid areas where vehicle-pedestrian collisions occur. This data should be based on 911 reports of vehicle-pedestrian collisions or near-collisions. This feature in no way guarantees pedestrian safety, but it attempts to steer clear of high-risk areas.  

Accessibility 
Routes that look for “Accessibility” will seek routes with the following characteristics: 
Sidewalk ramps at street corners 
Blind talk-boxes at street crossings 
Low sidewalk slope (less steep route) 
Sidewalk quality (few cracks, holes, etc.) 
This data should be based on city-provided locations of ramps, talkboxes, and street steepness. The sidewalk quality should be based on city-provided sidewalk auditing data, and/or user-provided sidewalk quality data. 

Nature
Routes that look for “Nature” will seek routes that are near parks, trees, flowers, and water. This data should be based on public park, tree, and floral location data, and can also include user-provided data. 

Clean Air 
Routes that look for “Clean Air” will seek routes that have the least amount of air pollution (ozone). This data should be based on live ozone data from city sensors. 

Low Allergy 
Routes that look for “Low Allergy” will seek routes that have the lowest pollen count. This data should be based on live pollen data from city sensors. 

Pet-Friendliness 
Routes that look for “Pet Friendliness” will seek routes that are near parks, trees, flowers, water, and dog amenities (dog parks and dog waste dumps, for example). This data should be based on public park, tree, and floral location data, and can also include user-provided data (such as water bowls for dogs, etc.). 

Public Toilets 
Routes that look for “Public Toilets” will seek routes that are near public toilets. This data should be based on city public toilet locations, and can also include user-provided data on the quality of public toilets. 

<TODO: add definitions> 
Road/sidewalk quality 
Construction 
Weather conditions 
Light coverage 
Free Wifi 

