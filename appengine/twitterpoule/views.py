""" Views for recmd. Views are all classes that return html pages or process forms.
"""

### Imports ###

# Python imports

# Django Imports

from django.http import HttpResponse, HttpResponseRedirect, Http404


### Page Handlers ###

def frontpage(request):
    """ Renders the frontpage/redirects to mobile front page
    """
    return HttpResponseRedirect('static/index.html')
