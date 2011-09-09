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

# TiddlySpace settings
PLUGINS_LIST= `cat plugins.list`
LIBS_LIST=    `cat libs.list`
CM_LIST=      `cat cm.list`

# codemirror settings
# CM_TAG = v2.13
CM_TAG = master
CM_RAW = https://raw.github.com/marijnh/CodeMirror2
CM_LIB_DIR =   $(CM_RAW)/$(CM_TAG)/lib
CM_MODE_DIR =  $(CM_RAW)/$(CM_TAG)/mode
CM_THEME_DIR = $(CM_RAW)/$(CM_TAG)/theme

# uglify options
UGLIFY_OPTS = --overwrite

CSS_TEMPLATE = "template: ../t/css.template\nmeta: ../t/meta.txt\nbody:  ../tmp/"

CM_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nintro: ../t/LicenseCM.txt\nbody: ../tmp/"

JS_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nintro: ../t/dependsOnCodeMirror.js.txt\nbody: ../tmp/"


help:
	@echo "make getall .... load all dependencies from internet"
	@echo "make test ...... creates tests.html"
	@echo "make upstream .. creates a working upstream.html"
	@echo ""
	@echo "make distcm ....... uploads documentation to codemirror.tiddyspace.com"
	@echo "make distplugins .. uploads plugins to codemirror-plugins space"
	@echo "make distlibs ..... uploads cm libraries to codemirror-plugins space"
	@echo ""
	@echo "make clean ..... remove all auto generated stuff"

clean: clean-list
	rm *.html || true
	rm *.jar || true
	rm *.js || true

clean-list:
	rm *.list || true

upstream: clean upstream.html
	$(OPEN) upstream.html

test: clean tests.html
	$(OPEN) tests.html
	
tests.html:
	cook $(PWD)/tests.html.recipe tests.html

upstream.html: 
	cook $(PWD)/upstream.html.recipe upstream.html

# ---------
# tiddyspace deploy

cm-list: 
	@echo ""
	@echo "# cm-list: files used - dir upstream/content/ *.js, *.svg, *.tid, *.tiddler"

	ls -C1 upstream/content | awk '{print "upstream/content/"$$1}' > names.list
	
	egrep -o 'upstream/content/.*(\.js|\.svg|\.tid|\.tiddler)$$' names.list > cm.list
	@echo ""
	cat cm.list


plugins-list: 
	@echo ""
	@echo "# plugin-list: files used - dir plugins/ *.js, *.svg, *.tid, *.tiddler"

	cat plugins/tiddlyspace.recipe | awk '{print "plugins/"$$2}' > plugins.list
	cat plugins.list

libs-list: 
	@echo ""
	@echo "# CodeMirror library-list: files used - dir lib/ *.js, *.svg, *.tid, *.tiddler"

	ls -C1 lib | awk '{print "lib/"$$1}' > names.list
	
	egrep -o 'lib/.*(\.js|\.svg|\.tid|\.tiddler)$$' names.list > libs.list
	@echo ""
	cat libs.list

distcm: cm-list
	./upload.sh codemirror $(CM_LIST)

distplugins: plugins-list
	./upload.sh codemirror-plugins $(PLUGINS_LIST)
	
distlibs: libs-list
	./upload.sh codemirror-plugins $(LIBS_LIST)
	
# ---------

getall: tiddlers
	cp ./t/split.recipe ./lib
	@echo "--- done! ---"

getlibs: 
	@echo ""
	@echo "--- get basic codemirror libraries ---"
	curl -o "tmp/default.css" $(CM_THEME_DIR)/default.css
	
	curl -o "tmp/codemirror.css" $(CM_LIB_DIR)/codemirror.css
	curl -o "tmp/codemirror.js"  $(CM_LIB_DIR)/codemirror.js
	curl -o "tmp/overlay.js"     $(CM_LIB_DIR)/overlay.js	
	curl -o "tmp/runmode.js"     $(CM_LIB_DIR)/runmode.js

patch:
	@echo ""
	@echo "--- patch CodeMirror.getModeName() function ---"
	cp ../../../CodeMirror2/lib/codemirror.js tmp/codemirror.js
	uglifyjs $(UGLIFY_OPTS) tmp/codemirror.js 
		
getmodes: getlibs
	@echo ""
	@echo "--- get highlighting modules used for TW ---"
	curl -o "tmp/css.js"        $(CM_MODE_DIR)/css/css.js
	curl -o "tmp/javascript.js" $(CM_MODE_DIR)/javascript/javascript.js
	curl -o "tmp/htmlmixed.js"  $(CM_MODE_DIR)/htmlmixed/htmlmixed.js
	curl -o "tmp/python.js"     $(CM_MODE_DIR)/python/python.js
	curl -o "tmp/xml.js"        $(CM_MODE_DIR)/xml/xml.js

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

dropbox:
	cp upstream.html /media/Daten/DropBox/Dropbox/Public


