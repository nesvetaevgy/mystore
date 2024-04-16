from django.shortcuts import render
from django.views.decorators.cache import cache_page


def index(request):
	return render(request, 'index.html')