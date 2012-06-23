/***
|''Name''|zCodeMirrorPlugin|
|''Description''|Enables syntax highlighting for <pre> and <code> blocks. Adds a new formatter for {{{<code class='???'>}}}. Using the wonderfull CodeMirror library.|
|''Author''|PMario|
|''Version''|0.2.8|
|''Status''|''stable''|
|''Info''|CodeMirrorPluginInfo|
|''Source''|https://github.com/pmario/tw.CodeMirrorPlugin|
|''Documentation''|http://codemirror.tiddlyspace.com/|
|''License''|[[CC-BY-NC-SA|http://creativecommons.org/licenses/by-nc-sa/3.0/]]|
|''CoreVersion''|2.5.0|
|''Requires''|codemirror.js |
|''Keywords''|syntax highlighting color code mirror codemirror|
! Documentation
* ViewTemplate, EditTemplate and ToolbarCommands tiddler have to be adjusted. see: [[CodeMirrorPluginInfo]] 
* Full info, see: [[CodeMirrorPluginInfo]]
! Usage
!!!! StyleSheet
<<<
* The plugin automatically creates a shadow tiddler: StyleSheetCodeMirror, that can be adjusted to your needs.
<<<
!!!! Macros
Modes: {{{<<cmModes>>}}} ... displays the usable modes seen below
<<<
Modes: <<cmModes>>
<<<
MIMEs: {{{<<cmMimes>>}}} ... displays the usable mime types seen below. Same order as modes.
<<<
Modes: <<cmMimes>>
<<<
MIMEs: {{{<<cmMimeObjects>>}}} ... displays the usable mime types seen below. Same order as modes. Shows the structure as a JSON.
<<<
<<cmMimeObjects>>
<<<
!!!!Global Settings
<<<
* Have a look at: [[CodeMirrorConfig]]
<<<
!!!! ViewTemplate
<<<
* Same as macro, but will be executed automatically for every tiddler. see: [[CodeMirrorPluginInfo]]
<<<
!!!! Parameters
<<<
{{{<<highlightSyntax [tagName]>> }}}
* will render all blocks, with any defined tag name. eg: tagName = {{{code}}}.
* [tagName] is optional. Default is "pre".
<<<
!!!! Configuration options
<<<
Guess syntax: <<option chkGuessSyntax>> .. If activated, ~TiddlyWiky <pre> blocks will be rendered according to there block braces. see [[CodeMirrorInfo]]
Expert mode: <<option chkExpertSyntax>> .. If activated, additional values below will be used. see [[CodeMirrorInfo]]

{{{ {{{ }}} txtShText: <<option txtShText>> eg: 'brush:text'
{{{ / *{{{* / }}} txtShCss: <<option txtShCss>> eg: 'brush:css'
{{{ //{{{ }}} txtShPlugin: <<option txtShPlugin>> 'brush:javascript'
{{{ <!--{{{-->> }}} txtShXml: <<option txtShXml>> 'brush:xml'

Additional options
<<<
!!!! Known Issues
* If you find something, just post at [[Google discussion group|http://groups.google.com/group/tiddlywiki?hl=en]]
* I'm happy to get some general feedback too!
!!!! Revision History
<<<
* V 0.2.8 2012-06-23
** "smartTab" handling adjusted. see: ExtraKeysAddOn
** minor documentation adjustments about ViewTemplate, EditTemplate requirements.
* V 0.1.0 2011-09-07
** inital release
see full History at CodeMirrorPluginInfo
<<<
!!! Code
!!!!! {{{<<cmModes>>, <<cmMimes>>, <<cmMimeObjects>>}}}
***/
//{{{
version.extensions.CodeMirrorPlugin = {major: 0, minor: 2, revision: 5, date: new Date(2012,2,7)};

(function($) {

config.macros.cmModes = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		jQuery('<span/>').text(CodeMirror.listModes().join(', ')).appendTo(place);
	}
};

config.macros.cmMimes = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var cm = config.tools.cm;
		jQuery('<span/>').text(cm.listMimeNames().join(', ')).appendTo(place);
	}
};

config.macros.cmMimeObjects = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		jQuery('<span/>').text(JSON.stringify(CodeMirror.listMIMEs())).appendTo(place);
	}
};
//}}}
/***
!!!!! Type chooser to define the MIME type 
***/
//{{{
// create objects for typeChooser dropDown
config.macros.typeChooser = {};
config.views.editor.typeChooser = {};

// use this part if you need translation
merge(config.views.editor.typeChooser,{
	text: "content-type",
	tooltip: "Choose existing types to add to this tiddler",
	popupNone: "There are no content-types defined",
	typeTooltip: "Add the content-type '%0'"});

// content-type chooser 
config.macros.typeChooser.onClick = function(ev)
{
	var e = ev || window.event,
		lingo = config.views.editor.typeChooser,
		popup = Popup.create(this),
		data = $(this).data('data'),
		types = CodeMirror.listMIMEs();
	
	types.push({mime: '-none-', mode: 'none'});
	if(types.length === 0) {
		$('<li/>').text(lingo.popupNone).appendTo(popup);
	}
	var t, type, mode, tooltipText;
	for(t=0; t<types.length; t++) {
	
		tooltipText = (typeof types[t].mode === 'object') ? types[t].mode.name : types[t].mode;
		type = createTiddlyButton( createTiddlyElement(popup,'li'), 
					types[t].mime, lingo.typeTooltip.format([tooltipText]), config.macros.typeChooser.onTypeClick);

		$(type).data('data', data);

		type.setAttribute('type',types[t].mime);
		type.setAttribute('tiddler',this.getAttribute('tiddler'));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) {e.stopPropagation();}
	return false;
};

config.macros.typeChooser.onTypeClick = function(ev)
{
	var e = ev || window.event;
	if(e.metaKey || e.ctrlKey) {stopEvent(e);} //# keep popup open on CTRL-click

	var data = $(this).data('data'),
		type = this.getAttribute('type'),
		title = this.getAttribute('tiddler'),
		conf = config.tools.cm.conf,
		cm = config.tools.cm,
		cmOptions = {}, 
		mode;

	// TODO doesn't seem to be right here. 
	// SyntaxHL change should work in read only too, for demo purpose.
	if(!readOnly) {		
			// read actual global configuraiton
			config.tools.cm.init();

			// clear the input .. 
			$(data.input).val('');

			if (type == '-none-' || type == 'content-type') {
				story.setTiddlerField(title, '', '+1', data.ctfield);
			}
			else {
				story.setTiddlerField(title, type, '+1', data.ctfield);
			}

			$(data.btn).text(type);
			
			var text = $(story.getTiddler(title)).find('textarea[edit=text]');
			var editor = $(text[0]).data('editor');
			// save changes to textarea.
			if (editor) {editor.save();}
			
			// TODO if a tag overwrites the content-type, gray out/disable the content-type button.
			
			if (editor) $(editor.getWrapperElement()).remove();

			mode = cm.getModeObject(type);

			$.extend( cmOptions, conf['global']);
			$.extend( cmOptions, conf[mode.name]);
			$.extend( cmOptions.mode, mode);	// IMPORTANT overwrite mode, because it may be an object !!

			var tid = store.getTiddler(title);
			var cmField = story.hasTiddlerField(title, 'cm.height');
			// if there is a cmField it will win, because there may be a new setting.
			if (cmField) {
				$.extend(cmOptions, {cmHeight: cmField.getAttribute('value')});
			}
			else if (tid && tid.fields['cm.height']) {
				$.extend(cmOptions, {cmHeight: tid.fields['cm.height']});
			} // TODO this code is used several times -> refactoring needed
			
			cm.startEditor(text, cmOptions);					
	}
	return false;
};

config.macros.typeChooser.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var ctfield = params[0] || 'content-type';

	if(tiddler instanceof Tiddler) {
		var lingo = config.views.editor.typeChooser,
			btnText = (tiddler.fields[ctfield]) ? tiddler.fields[ctfield] : lingo.text,
			inpText = (tiddler.fields[ctfield]) ? tiddler.fields[ctfield] : '';

		// createTiddlyElement(parent, element, id, className, text, attribs)
		var $inp = $('<input type="text" edit="'+ctfield+'" size="20">').appendTo(place).val(inpText).hide();
		
		var btn = createTiddlyButton(place, btnText, lingo.tooltip, this.onClick);
		$(btn).data('data', {'input':$inp, 'btn':btn, 'ctfield':ctfield});
		
		btn.setAttribute('tiddler', tiddler.title);
		btn.setAttribute('exclude', params[0]);
	}
};
//}}}
/***
!!!!! {{{<<highlightSyntax>>}}} macro 
***/
//{{{
config.macros.highlightSyntax = {
	getElementsByClass: function (searchClass,node,tag) {
		var classElements = [];
        if ( node === null ) {node = document;}
        if ( tag === null )  {tag = '*';}
		
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp('(^|\\s)'+searchClass+'(:|\\s|$)');
		for (i = 0, j = 0; i < elsLen; i++) {
			if ( pattern.test(els[i].className) ) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	},
	
	// <<highlightSyntax tagName>>
	// <<highlightSyntax code>>  || <<highlightSyntax div>>
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {

		// the configured tagName can be temporarily overwritten by the macro.
		var output, cStr, modeName;
		var tagName = params[0] || 'pre';
		var arr = this.getElementsByClass('brush', story.findContainingTiddler(place), tagName);
		
		var src;
		for (i=0; i<arr.length; i++) {
			$output = $('<'+ tagName +' class="cm-s-default">'); // TODO theme handling
			$src = $(arr[i]);

			cStr = $src.attr('class');
			cStr = cStr.parseParams(null, null, true);

			modeName = getParam(cStr, 'brush', 'null');
			
			CodeMirror.runMode($src.text(), modeName, $output[0]);
			$src.replaceWith($output[0]);
		}			
	} // handler
};

})(jQuery);
//}}}
/***
!!!!! New formatter for {{{<code class='brush:??'>}}}
***/
//{{{
config.formatters.push({
	name: "highlightSyntax",
	match: "^<code[\\s]+[^>]+>\\n",
	element: "pre",
	handler: function(w)
	{
        this.lookaheadRegExp = /<code[\s]+class.*=.*["'](.*)["'].*>\n((?:^[^\n]*\n)+?)(^<\/code>$\n?)/img;
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
            var options = lookaheadMatch[1];
			var text = lookaheadMatch[2];
			var cmMode;
			
			if(config.browser.isIE) {
				text = text.replace(/\n/g,"\r");
			}
			var element = createTiddlyElement(w.output,this.element,null,options +' cm-s-default','');	// TODO check for theme

			// may be there will be additional params in the future.
			cmMode = options.parseParams(null, null, true);
			cmMode = getParam(cmMode, 'brush', 'null');
			
            CodeMirror.runMode(text, cmMode, element);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	}
});
//}}}
/***
!!!!! Add class attribute to pre, if defined
***/
//{{{
(function(formatters) { //# set up alias
	var helper = {};	
	helper.enclosedTextHelper = function(w){
		var attr;
		var co = config.options;
		var expert = (co.chkExpertSyntax !== undefined)? co.chkExpertSyntax : false;
		var guess  = (co.chkGuessSyntax !== undefined)? co.chkGuessSyntax : true;
		
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE) {
				text = text.replace(/\n/g,'\r');
			}
			switch(w.matchText) {
			case '{{{\n': // text
				attr = (expert) ? (co.txtShText) ? (co.txtShText) : 'text/plain' : 'text/plain' ;
				break;
			case '/*{{{*/\n': // CSS
				attr = (expert) ? (co.txtShCss) ? (co.txtShCss) : 'css' : 'css';
				break;
			case '//{{{\n': // plugin
				attr = (expert) ? (co.txtShPlugin) ? (co.txtShPlugin) : 'javascript' : 'javascript';
				break;
			case '<!--{{{-->\n': //template
				attr =  (expert) ? (co.txtShXml) ? (co.txtShXml) : 'xml' : 'xml';
				break;
			}
			var element = createTiddlyElement(w.output,this.element,null,' cm-s-default','');	// TODO check for theme
	        if (guess || expert) {
				CodeMirror.runMode(text, attr, element);
	        }

			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	};
	// merge the new helper function into formatterHelpers. 
	merge(config.formatterHelpers, helper);

})(config.formatters); //# end of alias
//}}}

/***
!!!!! CM tools and helper functions 
***/
//{{{
(function ($) {
	var me;

	if (!config.tools) config.tools = {};
	config.tools.cm = me = {
		locale: {
		},
		
		// since TW layout is very flexible, the actual hight for the editor viewport can be guessed only
		// formular used: window.height - title.h * 2 - toolbar.h * 2 - correction 
		// Editor scrolls into position, to be maximum visible.
		// TODO correction may be given by the user. eg cookie
		guessMaxHeight: function (corr) {
			var wh = $(window).height(),
				tih = ($('.title').height()) ? $('.title').height() : 0,
				toh = ($('.toolbar').height()) ? $('.toolbar').height() : 0;
				
			return wh - (tih + toh) * 2 - ((corr) ? corr : 0); 			
		},
		
		// This function is used, if there is a browser resize, 
		// or user want's to have max size
		resizeEditor : function(height) {
			var $cm =  $('.CodeMirror');
			$cm.width($cm.closest('.editor').width());
			if (height) { $cm.find('.CodeMirror-scroll').height(height)};
		},
		
		listMimeNames: function() {
			return CodeMirror.listMIMEs().map(function(el){return el.mime;});
		},
		
		getModeObject: function(mime) {
			var arr = CodeMirror.listMIMEs();
			var mode = {"name": 'null'};
			
			for (var i=0, iMax = arr.length; i < iMax; i += 1) {
				if (arr[i].mime == mime) {
					if (typeof arr[i].mode === 'object') {
						return arr[i].mode;
					}
					else if (typeof arr[i].mode === 'string' ) {
						mode.name = arr[i].mode;
						return mode;
					} // else if 
				} // if
			} // for
			return mode;
		},

		helper : {
			'true': true,
			'false': false,
			'null': null
		},

		calcTextSlices: function (text) {
			var a = [], slices = {};

			store.slicesRE.lastIndex = 0;
			var m = store.slicesRE.exec(text);
			while (m) {
				if (m[2]) {
					if (m[3] === '') {
						slices[m[2]] = '';
					}
					else if (isNaN(m[3])) {
						if (!slices[m[2]]) {
							slices[m[2]] = (m[3] in me.helper) ? me.helper[m[3]] : m[3];
						}
						else {
							if (typeof(slices[m[2]]) != 'string') {
								slices[m[2]].push((m[3] in me.helper) ? me.helper[m[3]] : m[3]);
							}
							else {
								a[0] = slices[m[2]];
								slices[m[2]] = a;
								slices[m[2]].push((m[3] in me.helper) ? me.helper[m[3]] : m[3]);
							}
						}
					}
					else {
						slices[m[2]] = parseFloat(m[3]);
					}
				}
				m = store.slicesRE.exec(text);
			}
			// console.log('slices: ', slices);
			return slices;
		},

		rdSettings: function (cName) {
			var settings = {};
			var text;
			var title = cName;
			var secSep = config.textPrimitives.sectionSeparator;

			var section = null;
			var pos = title.indexOf(secSep);
			if (pos != -1) {
				section = title.substr(pos + config.textPrimitives.sectionSeparator.length);
				title = title.substr(0, pos);
			}

			cName = (title) ? cName : tiddler.title + cName;

			title = (title) ? title : tiddler.title;
			
			if (store.tiddlerExists(title) || store.isShadowTiddler(title)) {
				text = store.getTiddlerText(cName);
				settings = me.calcTextSlices(text);
			}

			// special handling for functions.
			// There are only extraKeys addOns at the moment !!
			var p = ['extraKeys', 'onChange', 'onCursorActivity', 'onGutterClick', 'onFocus', 'onScroll', 'onHighlightComplete', 'onKeyEvent'];
			var ctca = config.tools.cm.addOns;

			var x;
			for (var i = 0, im = p.length; i<im; i += 1) {
				x = settings[p[i]];
				if (x) {
					// it's possible to have arrays of addOns 
					if (typeof(x) == 'object') {
						settings[p[i]] = {};
						for (var j = 0; j < x.length; j++) {
							$.extend(settings[p[i]], (ctca && ctca[x[j]]) ? ctca[x[j]] : null);
						}
					} 
					else { 
						settings[p[i]] = (ctca && ctca[x]) ? ctca[x] : null;
					}
				}
			}
			return settings;
		},

		// stores the global CM config settings 
		conf: {},
		
		init: function() {
			var cm = 'CodeMirrorConfig', modes;
			var secSep = config.textPrimitives.sectionSeparator;
			
			// global settings need to be read seperately	
			me.conf['global'] = me.rdSettings(cm + secSep + 'global');

			// check CM for installed modes and get usre config if available
			modes = CodeMirror.listModes();
			for (var i=0; i < modes.length; i += 1) {
				me.conf[modes[i]] = me.rdSettings(cm + secSep + modes[i]);
			}
		},

		startEditor: function(textArea, cmOptions) {
			// disable chkInsertTabs
			var height =  null;
			var co = config.options;

			if (co.chkInsertTabs) {
				// it's better to disalbe this option. see: smartTab mode.
				$.extend(cmOptions.extraKeys, {"Tab": false, "Shift-Tab": false});
			}
			
			var editor = CodeMirror.fromTextArea(textArea[0], cmOptions);
			$(textArea[0]).data('editor', editor);
			if (cmOptions.cmHeight == 'max') {
				$(editor.getScrollerElement()).data('oldHeight', $(editor.getScrollerElement()).height());
				height = config.tools.cm.guessMaxHeight(25); // TODO 25 should be an option. 
			}
			config.tools.cm.resizeEditor(height);
			editor.focus();
			editor.refresh();
		}

	}; // end plugin

	// get and init the global CM settings 
// 	config.tools.cm.init();	

	// Probably not needed with TiddlySpace themes.
	// Deffinitely not needed with neui-em theme. The layout deals with it.
	$(window).resize(function() {
		config.tools.cm.resizeEditor(); 
	});

})(jQuery);

//}}}
/***
!!!!! TiddlySpace specific stuff
***/
//{{{

// Check, if there is the BinaryTiddlersPlugin TODO and use it. 
// If not check for content-type == text/....
(function($) {
var ctfield = 'content-type';

config.extensions.cm = me = {
	isTW : function(ctype) {
		return ctype.indexOf('tiddlywiki') != -1;
	},
	isTextual : function(ctype) {
		return ctype.indexOf('text/') === 0
			|| this.endsWith(ctype, '+xml')
			|| ctype == 'application/json'
			|| ctype == 'application/javascript';
	},
	endsWith: function(str, suffix) {
		return str.length >= suffix.length &&
			str.substr(str.length - suffix.length) == suffix;
	}	
};

// hijack text viewer to add special handling for binary tiddlers
var _view = config.macros.view.views.wikified;
config.macros.view.views.wikified = function(value, place, params, wikifier,
		paramString, tiddler) {
	var el;
	var ctype = tiddler.fields[ctfield];

	// TODO next line matches are ugly
	if(params[0] == 'text' && ctype && !tiddler.text.match('{{'+'{') && !tiddler.text.match('<code')) {
		if (!me.isTW(ctype) && me.isTextual(ctype)) {
			el = $('<pre class="cm-s-default">').appendTo(place); // TODO theme
			CodeMirror.runMode(tiddler.text, ctype, el[0]);
		} 
		else { _view.apply(this, arguments);}
	} // if
	else {_view.apply(this, arguments);}
}; // _view

})(jQuery);

//}}}
/***
!!!!! The default StyleSheetCodeMirror style sheet
***/
//{{{
config.shadowTiddlers["StyleSheetCodeMirror"]="/*{{{*/\n"+
	"[[codemirror.css]]\n"+
	"[[tiddlywiki.css]]\n"+
	"\n"+
	".CodeMirror {\n"+
	"	border: 1px solid [[ColorPalette::PrimaryMid]];\n"+
	"	background: [[ColorPalette::Background]];\n"+
	"}\n"+
	"/*}}}*/";
store.addNotification("StyleSheetCodeMirror",refreshStyles);
//}}}



