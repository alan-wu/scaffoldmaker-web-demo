#!/usr/bin/python
activate_this = '~/venv_opencmisslibs/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))
import cgitb
import cgi
import json
import os
import mesheroutput
from urlparse import unquote
cgitb.enable()
rootCollection = "organsViewerModels"

print "Content-Type: application/json"     # HTML is following
print                               # blank line, end of headers
	
	
def RepresentsInt(s):
	try: 
		int(s)
		return True
	except ValueError:
		return False

def getModelMeta():
	form = cgi.FieldStorage()
	options = {}
	for item in form:
		decodedName = unquote(item)
		if decodedName == 'Use cross derivatives':
			if form[item].value == 'true':
				options[decodedName] = True
			else:
				options[decodedName] = False
		elif RepresentsInt(form[item].value):
			options[decodedName] = int(form[item].value)
		else:
			options[decodedName] = float(form[item].value)
	return mesheroutput.outputModel(options)
	
	
print getModelMeta()
