
import json
import urllib.request
import urllib.parse


class HttpRequestManager():

    def __init__(self, baseUrl, timeoutSeconds = 10 ):
        self.timeoutSeconds = timeoutSeconds
        self.baseUrl = baseUrl
        return

    def post(self, jsonPost = {}, addedQsParams = {}, addedHeaders = {} ):

        headers = {'Content-Type': 'application/json'}
        headers.update(addedHeaders)

        fullUrl = self.baseUrl
        for index, param in enumerate(addedQsParams):
            if index == 0:
                queryParamPrefix = "?"
            else:
                queryParamPrefix = "&"

            safe = '$\':'
            fullUrl += queryParamPrefix + urllib.parse.quote(param, safe = safe) + "=" + urllib.parse.quote(addedQsParams[param], safe = safe)

        # print(fullUrl)
        req = urllib.request.Request(fullUrl)  # , data=json.dumps(jsonPost).encode('utf8'), headers=headers)

        # try:
        response = urllib.request.urlopen(req, timeout = self.timeoutSeconds)
        # except urllib2.HTTPError, e:
        #    print('HTTPError = ' + str(e.code))
        # except urllib2.URLError, e:
        #    print('URLError = ' + str(e.reason))
        # except httplib.HTTPException, e:
        #    print('HTTPException')
        # except Exception:
        #    import traceback
        #    print('generic exception: ' + traceback.format_exc())

        responseStr = (response.read().decode('utf8'))
        # print(responseStr)
        return responseStr
