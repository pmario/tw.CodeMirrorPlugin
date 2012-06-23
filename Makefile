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

# TiddlySpace settings
PLUGINS_LIST= `cat plugins.list`
LIBS_LIST=    `cat libs.list`
CM_LIST=      `cat cm.list`

# just to keep the structure
# https://raw.github.com/marijnh/CodeMirror2/master/mode/python/python.js
# codemirror settings
# 
# structure to load from tw-syntax branch
# https://raw.github.com/pmario/CodeMirror2/tw-syntax/mode/tiddlywiki/tiddlywiki.js

#CM_TAG = master

CM_TAG = v2.23
CM_RAW = https://raw.github.com/marijnh/CodeMirror2
CM_LIB_DIR =   $(CM_RAW)/$(CM_TAG)/lib
CM_MODE_DIR =  $(CM_RAW)/$(CM_TAG)/mode
CM_THEME_DIR = $(CM_RAW)/$(CM_TAG)/theme

# uglify options
# there needs to be --ascii, otherwise uglify breaks the library. 
UGLIFY_OPTS = --overwrite --ascii

CSS_TEMPLATE = "template: ../t/css.template\nmeta: ../t/meta.txt\ntags: ../t/tags.css.txt\nbody:  ../tmp/"

CM_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nintro: ../t/LicenseCM.txt\nbody: ../tmp/"

JS_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nintro: ../t/dependsOnCodeMirror.js.txt\nbody: ../tmp/"

PLUGIN_TEMPLATE  = "template: ../t/js.template\nmeta: ../t/meta.txt\ntags: ../t/tags.txt\nbody: ../tmp/"


# ---------------

help:
	@echo "make getall .... load all dependencies from internet"
	@echo "make test ...... creates tests.html"
	@echo "make upstream .. creates a working upstream.html"
	@echo "make vanilla ... create an empty vanilla.html"
	@echo ""
	@echo "make distall ...... calls the next three dist.."
	@echo "make distcm ....... uploads documentation to codemirror.tiddyspace.com"
	@echo "make distplugins .. uploads plugins to codemirror-plugins space"
	@echo "make distlibs ..... uploads cm libraries to codemirror-plugins space"
	@echo ""
	@echo "make commited ..... create all the *.list files to use **make distgit**"
	@echo "make distgit ...... uploads files, that have been recently commited to git."
	@echo ""
	@echo "make dropbox ... copy upstream.html to public dropbox folder."
	@echo ""
	@echo "make clean ..... remove all auto generated stuff"

clean: clean-lists
	rm *.html || true
	rm *.jar || true
	rm *.js || true

clean-lists:
	rm *.list || true

upstream: clean upstream.html
	$(OPEN) upstream.html

vanilla: clean vanilla.html
	$(OPEN) vanilla.html

test: clean tests.html
	$(OPEN) tests.html

tests.html:
	cook $(PWD)/tests.html.recipe -d $(PWD) -o tests.html

upstream.html: 
	cook $(PWD)/upstream.html.recipe -d $(PWD) -o upstream.html

vanilla.html: 
	cook $(PWD)/vanilla.html.recipe -d $(PWD) -o vanilla.html

# ---------
# tiddyspace deploy

cm.list:
	@echo ""
	@echo "# cm-list: files used - dir upstream/content/ *.js, *.svg, *.tid, *.tiddler"

	ls -C1 upstream/content | awk '{print "upstream/content/"$$1}' > names.list

	egrep -o 'upstream/content/.*(\.js|\.svg|\.tid|\.tiddler)$$' names.list > cm.list
	@echo ""
	cat cm.list


plugins.list:
	@echo ""
	@echo "# plugin-list: files used - dir plugins/ *.js, *.svg, *.tid, *.tiddler"

	cat plugins/split.recipe | awk '{print "plugins/"$$2}' > plugins.list
	cat plugins.list

libs.list:
	@echo ""
	@echo "# CodeMirror library-list: files used - dir lib/ *.js, *.svg, *.tid, *.tiddler"

	ls -C1 lib | awk '{print "lib/"$$1}' > names.list

	egrep -o 'lib/.*(\.js|\.svg|\.tid|\.tiddler)$$' names.list > libs.list
	@echo ""
	cat libs.list

distall: distcm distplugins distlibs
	@echo ""
	@echo "-- uploaded all libraries, plugins, content to TiddlySpace --"


distcm: cm.list
	@echo ""
	@echo "-- upload content --"
	./upload.sh codemirror $(CM_LIST)

distplugins: plugins.list
	@echo ""
	@echo "-- upload plugins --"
	./upload.sh codemirror-plugins $(PLUGINS_LIST)

distlibs: libs.list
	@echo ""
	@echo "-- upload libraries --"
	./upload.sh codemirror-plugins $(LIBS_LIST)

# ---------------
# git-hooks/pre-commit creates some info in ./commits dir. These file contain info about,
# what has been changed. The following lines create 

distgit: commited distplugins distcm
	@echo " -- uploading recently commited "	
	rm commits/*.list || true

commited: 
	@echo " -- if you need fresh *.list files, run **make clean** first "
	@echo ""
	ls -C1 commits | awk '{print "commits/"$$1}' > tmp.list
	
#-- get list of deleted files, just as an info
#	egrep -h 'D.*' `cat tmp.list` > deleted.list
	
#-- invers deleted -> what we want
	egrep -v -h 'D.*' `cat tmp.list` > all-commits.list
	sort all-commits.list | uniq > uniqe-commits.list
	
	egrep -h -o '(lib|plugins)/.*(\.js|\.svg|\.tid|\.tiddler)$$' uniqe-commits.list > plugins.list
	
	egrep -h -o 'upstream/.*(\.js|\.svg|\.tid|\.tiddler)$$' uniqe-commits.list > cm.list

# ---------

getall: tiddlers
	cp ./t/split.recipe ./lib
	@echo "--- done! ---"

getlibs: 
	@echo ""
	@echo "--- get basic codemirror libraries ---"
	curl -o "tmp/codemirror.css" $(CM_LIB_DIR)/codemirror.css
	curl -o "tmp/codemirror.js"  $(CM_LIB_DIR)/codemirror.js
	curl -o "tmp/overlay.js"     $(CM_LIB_DIR)/util/overlay.js	
	curl -o "tmp/runmode.js"     $(CM_LIB_DIR)/util/runmode.js

patch:
#	@echo ""
#	@echo "--- patch CodeMirror.getModeName() function ---"
#	cp ../../../CodeMirror2/lib/codemirror.js tmp/codemirror.js
#	uglifyjs $(UGLIFY_OPTS) tmp/codemirror.js

getmodes: getlibs copymode
	@echo ""
	@echo "--- get highlighting modules used for TW ---"
	curl -o "tmp/css.js"        $(CM_MODE_DIR)/css/css.js
	curl -o "tmp/javascript.js" $(CM_MODE_DIR)/javascript/javascript.js
	curl -o "tmp/htmlmixed.js"  $(CM_MODE_DIR)/htmlmixed/htmlmixed.js
	curl -o "tmp/python.js"     $(CM_MODE_DIR)/python/python.js
	curl -o "tmp/xml.js"        $(CM_MODE_DIR)/xml/xml.js

copymode:
	cp ../../../CodeMirror2/lib/util/runmode.js tmp/runmode.js
	cp ../../../CodeMirror2/mode/tiddlywiki/tiddlywiki.js tmp/tiddlywiki.js
	cp ../../../CodeMirror2/mode/tiddlywiki/tiddlywiki.css tmp/tiddlywiki.css

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
	uglifyjs $(UGLIFY_OPTS) tmp/tiddlywiki.js 

recipes: uglify
	@echo ""
	@echo "--- create recipes for single js tiddlers ---"
	echo $(CSS_TEMPLATE)codemirror.css > lib/codemirror.css.recipe
	echo $(CSS_TEMPLATE)tiddlywiki.css > lib/tiddlywiki.css.recipe

	echo $(CM_TEMPLATE)codemirror.js  > lib/codemirror.js.recipe

	echo $(JS_TEMPLATE)overlay.js     > lib/overlay.js.recipe
	echo $(JS_TEMPLATE)runmode.js     > lib/runmode.js.recipe
	echo $(JS_TEMPLATE)css.js         > lib/css.js.recipe
	echo $(JS_TEMPLATE)javascript.js  > lib/javascript.js.recipe
	echo $(JS_TEMPLATE)htmlmixed.js   > lib/htmlmixed.js.recipe
	echo $(JS_TEMPLATE)python.js      > lib/python.js.recipe
	echo $(JS_TEMPLATE)xml.js         > lib/xml.js.recipe

	echo $(PLUGIN_TEMPLATE)tiddlywiki.js  > lib/tiddlywiki.js.recipe

tiddlers: recipes
	@echo ""
	@echo "--- create tiddlers with cook ---"

	cook $(PWD)/lib/codemirror.css.recipe -d $(PWD)/lib -o codemirror.css.tid
	cook $(PWD)/lib/tiddlywiki.css.recipe -d $(PWD)/lib -o tiddlywiki.css.tid

	cook $(PWD)/lib/codemirror.js.recipe  -d $(PWD)/lib -o codemirror.js.tid
	cook $(PWD)/lib/overlay.js.recipe     -d $(PWD)/lib -o overlay.js.tid
	cook $(PWD)/lib/runmode.js.recipe     -d $(PWD)/lib -o runmode.js.tid
	cook $(PWD)/lib/css.js.recipe         -d $(PWD)/lib -o css.js.tid
	cook $(PWD)/lib/javascript.js.recipe  -d $(PWD)/lib -o javascript.js.tid
	cook $(PWD)/lib/htmlmixed.js.recipe   -d $(PWD)/lib -o htmlmixed.js.tid
	cook $(PWD)/lib/python.js.recipe      -d $(PWD)/lib -o python.js.tid
	cook $(PWD)/lib/xml.js.recipe         -d $(PWD)/lib -o xml.js.tid
	cook $(PWD)/lib/tiddlywiki.js.recipe  -d $(PWD)/lib -o tiddlywiki.js.tid

dropbox: upstream.html
	cp upstream.html /media/Daten/DropBox/Dropbox/Public


