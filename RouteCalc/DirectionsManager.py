import networkx as nx
import math

class DirectionsManager():

    def __init__(self):
        
        #
        # Directions Constants 
        #

        self.CONST_LEFT = "left"
        self.CONST_RIGHT = "right"
        self.CONST_STRAIGHT = "straight"
        self.CONST_BACK = "back"
        self.CONST_CONTINUE = "Continue"
        self.CONST_ONTO = "onto"
        self.CONST_SPACE = " "
        self.CONST_STAYON = "to stay on"
        self.CONST_START = "Start"
        self.CONST_STARTON = "Start on"
        self.CONST_TURN = "Turn"
        self.CONST_NAMELESS_ROAD = "Small Nameless Road"

        # --------------------------------------
        return

    #
    # Get the angle, in degrees, between two vectors  
    # 
    # Parameters: 
    #   vector1 - a tuple (x, y)
    #   vector2 - a tuple (x, y)
    #
    # Returns: 
    #   The angle, in degrees (between -180 and 180), between the two vectors 
    #
    def getAngleBetweenVectors(self, vector1, vector2):
        # dotProduct = x1*x2 + y1y*2
        dotProduct = vector1[0] * vector2[0] + vector1[1]*vector2[1]
        # determinant = x1*y2 - y1*x2
        determinant = vector1[0] * vector2[1] - vector1[1]*vector2[0]
        return (180 / math.pi) * math.atan2(determinant, dotProduct)

    #
    # Get the node and data objects from a networkx graph for a given node
    # 
    # Parameters: 
    #   myNode - a node ID for a networkx node 
    #   graph - a networkx graph
    #
    # Returns: 
    #   Node ID, Node data objects 
    #
    def getNodeDataFromId(self, myNode, graph):
        for node, data in graph.nodes_iter(data=True):  
            if node == myNode:
                return node, data 
            
    #
    # Get the direction string (e.x. "Left", "Right", etc.) from an 
    #  angle (in degrees between -180 and 180). 
    #  The angle is between two vectors, where the first vector 
    #  corresponds to the positive X axis, and the second vector starts from Origin
    # 
    # Parameters: 
    #   angle - angle in degrees, between -180 and 180 
    #
    # Returns: 
    #   A direction string (e.x. "Left", "Right", etc.) describing what direction 
    #    should be taken to travel from a first vector onto a second vector, given the angle 
    #    between the two vectors  
    #
    def getDirectionStringFromAngle(self, angle):
        if 20 <= angle <= 160:
            return self.CONST_LEFT
        elif -160 <= angle <= -20:
            return self.CONST_RIGHT
        elif -20 <= angle <= 20:
            return self.CONST_STRAIGHT
        elif (160 <= angle <= 180) or (-180 <= angle <= -160):
            return self.CONST_BACK

    #
    # Clean a set of "simple" directions by combining consecutive "straight" directions
    #  and add modifiers to "simple" directions (turn "Left" into "Turn Left Onto...")
    # 
    # Parameters: 
    #   directions - a list of direction JSON objects, with "simple" directions "Left", "Straight", etc.   
    #
    # Returns: 
    #   A list of direction JSON objects that is ready for rendering
    #
    def cleanDirections(self, directions):

        #
        # First, iterate through all the directions and combine consecutive "straight" directions 
        #
        for index, currentDirection in enumerate(directions):
            if index < len(directions) - 1:
                nextDirection = directions[index + 1]

                while (nextDirection['direction'] == self.CONST_STRAIGHT == currentDirection['direction']) and (nextDirection['name'] == currentDirection['name']):
                    
                    # Replace with a single, combined direction 
                    direction_data = { "node": [currentDirection['node'], nextDirection['node']], "name": currentDirection['name'], "direction": self.CONST_STRAIGHT, "vectorAngle": 0, "length": nextDirection['length'] + currentDirection['length'] }
                    del directions[index + 1]
                    del directions[index]
                    directions.insert(index, direction_data)

                    # Continue iterating through the next direction, unless we run out of list, then break from the 'while' loop
                    if index < len(directions) - 1:
                        currentDirection = nextDirection 
                        nextDirection = directions[index + 1]
                    else: 
                        break;

        #
        # Next, iterate through all the directions again and update the direction names 
        #        
        for index, currentDirection in enumerate(directions):
            
            #
            # Add the starting direction for the first entry 
            #
            if index == 0: 
                full_direction = self.CONST_STARTON + self.CONST_SPACE + currentDirection['name']
                currentDirection['direction'] = full_direction
                continue

            previousDirection = directions[index - 1]
            prefix = self.CONST_TURN
            if currentDirection['direction'] == self.CONST_STRAIGHT:
                prefix = self.CONST_CONTINUE

            #
            # If the name's don't match, specify the "onto" text, otherwise, specify the "stay on" text  
            #    
            if previousDirection['name'].strip().lower() != currentDirection['name'].strip().lower():            
                full_direction = prefix + self.CONST_SPACE + currentDirection['direction'] + self.CONST_SPACE + self.CONST_ONTO + self.CONST_SPACE + currentDirection['name']
            else: 
                full_direction = prefix + self.CONST_SPACE + currentDirection['direction'] + self.CONST_SPACE + self.CONST_STAYON + self.CONST_SPACE + currentDirection['name']    

            currentDirection['direction'] = full_direction

        return directions

    #
    # Get the name and length of an edge between two nodes 
    # 
    # Parameters: 
    #   graph - a networkx graph 
    #   firstNode - a node ID
    #   secondNode - a node ID
    #
    # Returns: 
    #   EdgeName, EdgeLength corresponding to the edge name and edge length 
    #
    def getEdgeNameAndLength(self, graph, firstNode, secondNode):
        edgeName = self.CONST_NAMELESS_ROAD
        edgeLength = 0
        edge = graph.get_edge_data(firstNode, secondNode)
        if 'name' in edge[0]: 
            edgeName = edge[0]['name']
        if 'length' in edge[0]:
            edgeLength = edge[0]['length']

        # Some edges have a list of names
        #  Join them together into a comma-separated string for display to user     
        if isinstance(edgeName, list):
            edgeName = ", ".join(edgeName)
        
        return edgeName, edgeLength 

    #
    # Get the directions strings for a given path (set of nodes)
    # 
    # Parameters: 
    #   path - a list of node IDs representing nodes in the given graph.
    #    The path should be ordered so that the first node in the path is the source node, and the 
    #     last node in the path is the destination node 
    #
    # Returns: 
    #   A list of direction JSON objects that is ready for rendering
    #
    def getDirectionsForPath(self, path, graph):

        directions = []
        if(len(path) <= 1):
            return directions 

        for index, pathnode in enumerate(path):
            currentNode, currentNodeData = self.getNodeDataFromId(pathnode, graph)
            vectorAngle = (180 / math.pi) * math.atan2(currentNodeData['y'], currentNodeData['x'])
            print("First Vector Angle")
            print(vectorAngle)

            if index < len(path) - 1:
                nextNode, nextNodeData = self.getNodeDataFromId(path[index + 1], graph)
                
                # Get the edge between current node and next node 
                edgeName, edgeLength = self.getEdgeNameAndLength(graph, currentNode, nextNode)                
                            
                if index == 0:
                    # Add the starting direction                     
                    direction_data = { "node": currentNode, "name": edgeName, "direction": self.CONST_START, "vectorAngle": vectorAngle, "length": edgeLength }
                    directions.append(direction_data)
                    continue

                if index < len(path) - 2:
                    twoNextNode, twoNextNode = self.getNodeDataFromId(path[index + 2], graph)

                    # TODO: Why do we have to call the 'osmid' for twoNextNode?
                    nextEdgeName, nextEdgeLength = self.getEdgeNameAndLength(graph, nextNode, twoNextNode['osmid'])    
                    
                    #
                    # Generate the vectors between (currentNode, nextNode) and (nextNode, twoNextNode)
                    #
                    firstVector = (nextNodeData['x'] - currentNodeData['x'], nextNodeData['y'] - currentNodeData['y'])
                    secondVector = (twoNextNode['x'] - nextNodeData['x'], twoNextNode['y'] - nextNodeData['y'])
                    vectorAngle = self.getAngleBetweenVectors(firstVector, secondVector)

                    print("Second Vector Angle")
                    print(vectorAngle)
                    direction_data = { "node": currentNode, "name": nextEdgeName, "direction": self.getDirectionStringFromAngle(vectorAngle), "vectorAngle": vectorAngle, "length": nextEdgeLength }
                    directions.append(direction_data)
                    continue

                direction_data = { "node": currentNode, "name": edgeName, "direction": self.getDirectionStringFromAngle(vectorAngle), "vectorAngle": vectorAngle, "length": edgeLength }
                directions.append(direction_data)

        return self.cleanDirections(directions)