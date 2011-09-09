/***
|''Name''|CodeMirror2Plugin|
|''Description''|Enables syntax highlighting using CodeMirror2|
|''Author''|PMario|
|''Version''|0.1.1|
|''Status''|''beta''|
|''Source''|https://github.com/pmario/tw.CodeMirrorPlugin|
|''License''|[[CC-BY-NC-SA|http://creativecommons.org/licenses/by-nc-sa/3.0/]]|
|''CoreVersion''|2.5.0|
|''Requires''|codemirror.js overlay.js runmode.js xml.js python.js javascript.js css.js htmlmixed.js |
|''Keywords''|syntax highlighting color code mirror codemirror|
!Documentation
* see: [[CodeMirror2PluginInfo]]
!Description
Enables syntax highlighting for <pre> and <code> blocks. Adds a new formatter for {{{<code class='???'>}}} 
!Usage
!!!!StyleSheet
<<<
* The plugin automatically creates a shadow StyleSheetCodeMirror2 tiddler, that can be adjusted to your needs.
<<<

!!!!Macros
<<<
Modes: {{{<<cmModes>>}}} ... displays the usable modes.
Modes: <<cmModes>>

MIMEs: {{{<<cmMIMEs>>}}} ... displays the usable mime types. Same order as modes.
Modes: <<cmMIMEs>>
<<<
!!!!Global Settings
<<<
* Have a look at: CodeMirror2Config
<<<
!!!!ViewTemplate
<<<
* Same as macro, but will be executed automatically for every tiddler. see: [[CodeMirror2Info]]
<<<
!!!!Parameters
<<<
{{{<<highlightSyntax [tagName]>> }}}
* will render all blocks, with any defined tag name. eg: tagName = {{{code}}}.
* [tagName] is optional. Default is "pre".
<<<
!!!!Configuration options
<<<
Guess syntax: <<option chkGuessSyntax>> .. If activated, ~TiddlyWiky <pre> blocks will be rendered according to there block braces. see [[CodeMirror2Info]]
Expert mode: <<option chkExpertSyntax>> .. If activated, additional values below will be used. see [[CodeMirror2Info]]

{{{ {{{ }}} txtShText: <<option txtShText>> eg: 'brush:text'
{{{ / *{{{* / }}} txtShCss: <<option txtShCss>> eg: 'brush:css'
{{{ //{{{ }}} txtShPlugin: <<option txtShPlugin>> 'brush:javascript'
{{{ <!--{{{-->> }}} txtShXml: <<option txtShXml>> 'brush:xml'

Additional options ???????????????????
<<<
!!!! Known Issues
* Theme switching not supported yet
* Detecting content-type in ViewMode, EditMode has some inconsistencies
* Code is ugly
** Uses too many different namespaces
** Lots of TODOs 

!!!! Revision History
<<<
* V 0.1.0 2011-09-07
** inital release
<<<

!!!!ToDo
<<<
*
<<<
!!!Code
***/

//{{{
version.extensions.CodeMirror2Plugin = {major: 0, minor: 1, revision: 1, date: new Date(2011,9,9)};

(function($) {

if(!window.CodeMirror) {
	throw "Missing dependency: CodeMirror";
}
else if(!window.CodeMirror.runMode) {
	throw "Missing dependency: CodeMirror-runmode library";
}

config.macros.cmModes = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		jQuery("<span/>").text(CodeMirror.listModes().join(', ')).appendTo(place);
	}
};

config.macros.cmMIMEs = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		jQuery("<span/>").text(CodeMirror.listMIMEs().join(', ')).appendTo(place);
	}
};

config.macros.typeChooser = {};
config.views.editor.typeChooser = {};
merge(config.views.editor.typeChooser,{
	text: "content-type",
	tooltip: "Choose existing types to add to this tiddler",
	popupNone: "There are no content-types defined",
	typeTooltip: "Add the content-type '%0'"});


config.macros.typeChooser.onClick = function(ev)
{
	var e = ev || window.event;
	var lingo = config.views.editor.typeChooser;
	var popup = Popup.create(this);

	var data = $(this).data("data");

// console.log('onClick', data);

	var types = CodeMirror.listMIMEs();
	types.push('-none-');
	if(types.length === 0) {
		$("<li/>").text(lingo.popupNone).appendTo(popup);
	}
	var t;
	for(t=0; t<types.length; t++) {
		var type = createTiddlyButton(createTiddlyElement(popup,"li"),types[t],lingo.typeTooltip.format([types[t]]),config.macros.typeChooser.onTypeClick);

		$(type).data('data', data);

		type.setAttribute("type",types[t]);
		type.setAttribute("tiddler",this.getAttribute("tiddler"));
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

	var data = $(this).data("data");

// console.log('onTypeClick', data);
	var type = this.getAttribute("type");
	var title = this.getAttribute("tiddler");
	var conf = config.tools.cm2.conf;
	var cmOptions = {}, mode;
	
	if(!readOnly) {		// TODO doesn't seem to be right here!
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
			
			// TODO do nothing, if mode didn't change
			// TODO if a tag overwrites the content-type, gray out the content-type button.
			
			$(editor.getWrapperElement()).remove();

			mode = CodeMirror.getModeName(type);

			if (conf[mode]) {
				cmOptions = conf[mode];
			}
			else {cmOptions = {mode : 'null'};}

			$.extend(cmOptions, conf['global']);
			
			editor = CodeMirror.fromTextArea(text[0], cmOptions);

			$(text[0]).data('editor', editor);
			config.tools.cm2.resizeEditor();					
	}
	return false;
};

config.macros.typeChooser.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var ctfield = params[0] || 'content-type';
	
	if(tiddler instanceof Tiddler) {
		var lingo = config.views.editor.typeChooser;
		var btnText = (tiddler.fields[ctfield]) ? tiddler.fields[ctfield] : lingo.text;
		var inpText = (tiddler.fields[ctfield]) ? tiddler.fields[ctfield] : '';

		// createTiddlyElement(parent, element, id, className, text, attribs)
		var $inp = $('<input type="text" edit="'+ctfield+'" size="20">').appendTo(place).val(inpText).hide();
// 		console.log($inp);
		
		var btn = createTiddlyButton(place, btnText, lingo.tooltip, this.onClick);
		$(btn).data('data', {'input':$inp, 'btn':btn, 'ctfield':ctfield});
		
		btn.setAttribute("tiddler", tiddler.title);
		btn.setAttribute("exclude", params[0]);
	}
};


config.macros.highlightSyntax = {
	getElementsByClass: function (searchClass,node,tag) {
		var classElements = [];
        if ( node === null ) {node = document;}
        if ( tag === null )  {tag = '*';}
		
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)"+searchClass+"(:|\\s|$)");
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
!!!!!New formatter for {{{<code class='brush:??'>}}}
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
!!!!!Add class attribute to pre, if defined
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
				text = text.replace(/\n/g,"\r");
			}
			switch(w.matchText) {
			case "{{{\n": // text
				attr = (expert) ? (co.txtShText) ? (co.txtShText) : 'text/plain' : 'text/plain' ;
				break;
			case "/*{{{*/\n": // CSS
				attr = (expert) ? (co.txtShCss) ? (co.txtShCss) : 'css' : 'css';
				break;
			case "//{{{\n": // plugin
				attr = (expert) ? (co.txtShPlugin) ? (co.txtShPlugin) : 'javascript' : 'javascript';
				break;
			case "<!--{{{-->\n": //template
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

(function ($) {
	var me, conf;

	config.tools = {};
	config.tools.cm2 = {};
	config.tools.cm2.addOns = {};
	config.tools.cm2 = me = {

		// TODO fix this hack ...		
		resizeEditor : function() {
			var jqe = $('.editor');
			jqe.find('.CodeMirror').width(jqe.width());
		},
	
		helper : {
			'true': true,
			'false': false,
			'null': null
		},

		calcTextSlices: function (text) {
			var slices = {};

			store.slicesRE.lastIndex = 0;
			var m = store.slicesRE.exec(text);
			while (m) {
				if (m[2]) {
					if (m[3] === '') {
						slices[m[2]] = '';
					}
					else if (isNaN(m[3])) {
						slices[m[2]] = (m[3] in me.helper) ? me.helper[m[3]] : m[3];
					}
					else {
						slices[m[2]] = parseFloat(m[3]);
					}
				} else {
					if (m[6] === '') {
						slices[m[5]] = '';
					}
					else if (isNaN(m[6])) {
						slices[m[5]] = (m[6] in me.helper) ? me.helper[m[6]] : m[6];
					}
					else {
						slices[m[5]] = parseFloat(m[6]);
					}
				}
				m = store.slicesRE.exec(text);
			}
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
			var p = ['onChange', 'onCursorActivity', 'onGutterClick', 'onFocus', 'onScroll', 'onHighlightComplete', 'onKeyEvent'];
			var ctca = config.tools.cm2.addOns;

			var x;
			for (var i = 0, im = p.length; i<im; i += 1) {
				x = settings[p[i]];
				if (x) {
					settings[p[i]] = (ctca && ctca[x]) ? ctca[x] : null;
				}
			}
			return settings;
		}
	}; // end plugin
		
	config.tools.cm2.conf = conf = {};
		
	var cm = 'CodeMirror2Config', modes;
	var secSep = config.textPrimitives.sectionSeparator;

	// global settings need to be read seperately	
	conf['global'] = me.rdSettings(cm + secSep + 'global');

	// check CM for installed modes and get usre config if available
	modes = CodeMirror.listModes();
	for (var i=0; i < modes.length; i += 1) {
		conf[modes[i]] = me.rdSettings(cm + secSep + modes[i]);
	}
// console.log({'config.tools.cm2.conf' : config.tools.cm2.conf});

	// TODO fix editor resize hack.	
	// Probably not needed with TiddlySpace themes.
	// Deffinitely not needed with neui-em theme. The layout deals with it.
	$(window).resize(function() {
		config.tools.cm2.resizeEditor(); 
	});

})(jQuery);


// Check, if there is the BinaryTiddlersPlugin TODO and use it. 
// If not check for content-type == text/....
(function($) {
var ctfield = "content-type";

config.extensions.cm2 = me = {
	isTextual : function(ctype) {
		return ctype.indexOf("text/") === 0
			|| this.endsWith(ctype, "+xml")
			|| ctype == 'application/json'
			|| ctype == 'application/javascript';
	}
};

// hijack text viewer to add special handling for binary tiddlers
var _view = config.macros.view.views.wikified;
config.macros.view.views.wikified = function(value, place, params, wikifier,
		paramString, tiddler) {
	var el;
	var ctype = tiddler.fields[ctfield];

	// TODO next line matches are ugly
	if(params[0] == "text" && ctype && !tiddler.text.match('{{'+'{') && !tiddler.text.match('<code')) {
		if (me.isTextual(ctype)) {
			el = $('<pre class="cm-s-default">').appendTo(place); // TODO theme
			
			CodeMirror.runMode(tiddler.text, CodeMirror.getModeName(ctype), el[0]);
			
//			el = $("<pre />").text(tiddler.text);
//			el.appendTo(place);
		} 
		else _view.apply(this, arguments);
	} // if
	else  _view.apply(this, arguments);		
}; // _view

})(jQuery);

config.shadowTiddlers["StyleSheetCodeMirror2"]="/*{{{*/\n"+
	"[[codemirror.css]]\n"+
	"[[default.css]]\n"+
	"\n"+
	".CodeMirror {\n"+
	"	border: 1px solid [[ColorPalette::PrimaryMid]];\n"+
	"	background: [[ColorPalette::PrimaryPale]];\n"+
	"}\n"+
	"/*}}}*/";
store.addNotification("StyleSheetCodeMirror2",refreshStyles);
store.addNotification("codemirror.css",refreshStyles);
store.addNotification("default.css",refreshStyles);
//}}}
