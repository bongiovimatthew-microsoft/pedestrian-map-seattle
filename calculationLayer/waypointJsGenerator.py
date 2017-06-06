import re

# 
# Read GEOJSON from file, and strip out all whitespace 
#
allData = "" 
with open("data.json", "r") as dataReader: 
    for dataLine in dataReader:
        allData += re.sub('[\s+]', '', dataLine)

#
# Read calculator template and create JS with embedded GEOJSON data 
#
with open("waypointCalculator_template", "rt") as templateReader:
    with open("waypointCalculator.js", "wt") as outputReader:
        for line in templateReader:
            outputReader.write(line.replace('%%data_blob%%', allData))