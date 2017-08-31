from pprint import pprint as pp
import json

#
# Validates that a request meets the criteria we specify
#
# Parameters: 
#   request - the raw request 
# 
# Return: 
#   The HttpResponse for the error, or "None" if the request is valid 
#
def validateRequest(request):
    print("request.Method: " + request.method)
    if request.method == "GET":
        return HttpResponse("Use a post request!")

    print("request.POST: ")
    pp(request.body)

    requestBodyString = str(request.body.decode('utf-8'))
    if not requestBodyString: 
        print("Empty request")
        return HttpResponse("Empty request")

    return None

#
# Validates and decodes a raw request 
#
# Parameters: 
#   request - the raw request 
# 
# Return: 
#   The HttpResponse for the error, or "None" if the request is valid, along with the 
#    JSON dictionary of the decoded request  
#
def getDecodedRequest(request):
    # TODO: We should be doing this as try/catch instead 
    errorResponse = validateRequest(request)
    if errorResponse:
        return errorResponse, None

    return None, json.loads(str(request.body.decode('utf-8')))