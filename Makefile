# Start at a Makefile or managing build activities.
# Expects a 'cook' script somewhere on the $PATH.
# See 'cook' in this directory for a sample you can use.
# For now users the OSX specific "open" to run a test file. This
# will need to change.
#
# create a file OPEN_COMMAND and add:
# gnome-open  .. if you use ubuntu gnome OR
# open .. if you use OSX

# just to keep the structure
# https://raw.github.com/marijnh/CodeMirror2/master/mode/python/python.js


OPEN=`cat OPEN_COMMAND`

# codemirror settings
# CM_TAG = v2.13
CM_TAG = master
CM_RAW = https://raw.github.com/marijnh/CodeMirror2
CM_LIB_DIR = $(CM_RAW)/$(CM_TAG)/lib
CM_MODE_DIR = $(CM_RAW)/$(CM_TAG)/mode
CM_THEME_DIR = $(CM_RAW)/$(CM_TAG)/theme

# uglify options
UGLIFY_OPTS = --overwrite

CSS_TEMPLATE = "template: ../t/css.template\nmeta: ../t/meta.txt\nbody:  ../tmp/"

CM_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nbody: ../tmp/"

JS_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nintro: ../t/dependsOnCodeMirror.js.txt\nbody: ../tmp/"


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

getall: tiddlers
	cp ./t/split.recipe ./lib
	@echo "--- done! ---"

getlibs: 
	@echo ""
	@echo "--- get basic codemirror libraries ---"
	curl -o "tmp/default.css" $(CM_THEME_DIR)/default.css
	
	curl -o "tmp/codemirror.css" $(CM_LIB_DIR)/codemirror.css
	curl -o "tmp/codemirror.js" $(CM_LIB_DIR)/codemirror.js
	curl -o "tmp/overlay.js" $(CM_LIB_DIR)/overlay.js	
	curl -o "tmp/runmode.js" $(CM_LIB_DIR)/runmode.js

patch:
	cp ../../../CodeMirror2/lib/codemirror.js tmp/codemirror.js
	uglifyjs $(UGLIFY_OPTS) tmp/codemirror.js 
		
getmodes: getlibs
	@echo ""
	@echo "--- get highlighting modules used for TW ---"
	curl -o "tmp/css.js" $(CM_MODE_DIR)/css/css.js
	curl -o "tmp/javascript.js" $(CM_MODE_DIR)/javascript/javascript.js
	curl -o "tmp/htmlmixed.js" $(CM_MODE_DIR)/htmlmixed/htmlmixed.js
	curl -o "tmp/python.js" $(CM_MODE_DIR)/python/python.js
	curl -o "tmp/xml.js" $(CM_MODE_DIR)/xml/xml.js

uglify: getmodes patch
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
	
recipes: uglify
	@echo ""
	@echo "--- create recipes for single js tiddlers ---"
	@echo $(CSS_TEMPLATE)codemirror.css > lib/codemirror.css.recipe
	@echo $(CSS_TEMPLATE)default.css > lib/default.css.recipe

	@echo $(CM_TEMPLATE)codemirror.js  > lib/codemirror.js.recipe

	@echo $(JS_TEMPLATE)overlay.js     > lib/overlay.js.recipe
	@echo $(JS_TEMPLATE)runmode.js     > lib/runmode.js.recipe
	@echo $(JS_TEMPLATE)css.js         > lib/css.js.recipe
	@echo $(JS_TEMPLATE)javascript.js  > lib/javascript.js.recipe
	@echo $(JS_TEMPLATE)htmlmixed.js   > lib/htmlmixed.js.recipe
	@echo $(JS_TEMPLATE)python.js      > lib/python.js.recipe
	@echo $(JS_TEMPLATE)xml.js         > lib/xml.js.recipe

tiddlers: recipes
	@echo ""
	@echo "--- create tiddlers with cook ---"

	cook $(PWD)/lib/codemirror.css.recipe /lib/codemirror.css.tid
	cook $(PWD)/lib/default.css.recipe    /lib/default.css.tid
	
	cook $(PWD)/lib/codemirror.js.recipe  /lib/codemirror.js.tid
	cook $(PWD)/lib/overlay.js.recipe     /lib/overlay.js.tid
	cook $(PWD)/lib/runmode.js.recipe     /lib/runmode.js.tid
	cook $(PWD)/lib/css.js.recipe         /lib/css.js.tid
	cook $(PWD)/lib/javascript.js.recipe  /lib/javascript.js.tid
	cook $(PWD)/lib/htmlmixed.js.recipe   /lib/htmlmixed.js.tid
	cook $(PWD)/lib/python.js.recipe      /lib/python.js.tid
	cook $(PWD)/lib/xml.js.recipe         /lib/xml.js.tid




