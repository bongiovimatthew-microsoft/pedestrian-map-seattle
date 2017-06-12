from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from pprint import pprint as pp

# issue-manish-06112017 remove csrf exempt
# Create your views here.
@csrf_exempt
def index(request):
    print("request.Method: " + request.method)
    if request.method == "POST":
        print("request.POST: ")
        pp(request.body)
    return HttpResponse("Got RouteCalc Request!")
