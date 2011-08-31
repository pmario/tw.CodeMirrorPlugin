# Start at a Makefile or managing build activities.
# Expects a 'cook' script somewhere on the $PATH.
# See 'cook' in this directory for a sample you can use.
# For now users the OSX specific "open" to run a test file. This
# will need to change.
#
# create a file OPEN_COMMAND and add:
# gnome-open  .. if you use ubuntu gnome OR
# open .. if you use OSX

OPEN=`cat OPEN_COMMAND`

# codemirror settings
CM_TAG = v2.13
CM_RAW = https://raw.github.com/marijnh/CodeMirror2
CM_LIB_DIR = $(CM_RAW)/$(CM_TAG)/lib
CM_MODE_DIR = $(CM_RAW)/$(CM_TAG)/mode

# uglify options
UGLIFY_OPTS = --overwrite

help:
	@echo "make getall .... creates all dependencies"
	@echo "make test ...... creates tests.htmlmixed"
	@echo "make upstream .. creates a working upstream.html"

clean:
	rm *.html || true
	rm *.jar || true
	rm *.js || true

upstream: clean upstream.html
	$(OPEN) upstream.html

test: clean tests.html
	$(OPEN) tests.html
	
tests.html:
	cook $(PWD)/tests.html.recipe tests.html

upstream.html: 
	cook $(PWD)/upstream.html.recipe upstream.html

getall: getlibs getmodes uglify tiddlers
	cp ./t/split.recipe ./lib
	@echo "--- done! ---"

getlibs: 
	@echo ""
	@echo "--- get basic codemirror libraries ---"
	curl -o "tmp/codemirror.css" $(CM_LIB_DIR)/codemirror.css
	curl -o "tmp/codemirror.js" $(CM_LIB_DIR)/codemirror.js
	curl -o "tmp/overlay.js" $(CM_LIB_DIR)/overlay.js	
	curl -o "tmp/runmode.js" $(CM_LIB_DIR)/runmode.js
	
getmodes:
	@echo ""
	@echo "--- get highlighting modules used for TW ---"
	curl -o "tmp/css.js" $(CM_MODE_DIR)/css/css.js
	curl -o "tmp/javascript.js" $(CM_MODE_DIR)/javascript/javascript.js
	curl -o "tmp/htmlmixed.js" $(CM_MODE_DIR)/htmlmixed/htmlmixed.js
	curl -o "tmp/python.js" $(CM_MODE_DIR)/python/python.js
	curl -o "tmp/xml.js" $(CM_MODE_DIR)/xml/xml.js

uglify:
	@echo ""
	@echo "--- compress libraries ---"
	uglifyjs $(UGLIFY_OPTS) tmp/codemirror.js 
	uglifyjs $(UGLIFY_OPTS) tmp/overlay.js 
	uglifyjs $(UGLIFY_OPTS) tmp/runmode.js 
	uglifyjs $(UGLIFY_OPTS) tmp/css.js 
	uglifyjs $(UGLIFY_OPTS) tmp/javascript.js 
	uglifyjs $(UGLIFY_OPTS) tmp/htmlmixed.js 
	uglifyjs $(UGLIFY_OPTS) tmp/python.js 
	uglifyjs $(UGLIFY_OPTS) tmp/xml.js 
	
tiddlers:		
	@echo ""
	@echo "--- create tiddlers for cook ---"
	cat ./t/css.tid ./tmp/codemirror.css ./t/css.end > ./lib/codemirror.css.tid

	cat ./t/js.tid ./tmp/codemirror.js ./t/js.end > ./lib/codemirror.js.tid
	cat ./t/js.tid ./tmp/overlay.js    ./t/js.end > ./lib/overlay.js.tid
	cat ./t/js.tid ./tmp/runmode.js    ./t/js.end > ./lib/runmode.js.tid
	cat ./t/js.tid ./tmp/css.js        ./t/js.end > ./lib/css.js.tid
	cat ./t/js.tid ./tmp/javascript.js ./t/js.end > ./lib/javascript.js.tid
	cat ./t/js.tid ./tmp/htmlmixed.js  ./t/js.end > ./lib/htmlmixed.js.tid
	cat ./t/js.tid ./tmp/python.js     ./t/js.end > ./lib/python.js.tid
	cat ./t/js.tid ./tmp/xml.js        ./t/js.end > ./lib/xml.js.tid


