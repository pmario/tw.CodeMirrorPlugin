/***
|''Name''|CodeMirror2Plugin|
|''Description''|Enables syntax highlighting using CodeMirror2|
|''Author''|PMario|
|''Version''|0.0.3|
|''Status''|''experimental''|
|''Source''||
|''License''|CC-BY-SA|
|''CoreVersion''|2.5.0|
|''Requires''|codemirror.js runmode.js AConfig|
|''Keywords''|syntax highlighting color code mirror codemirror|
!Documentation
* see: [[CodeMirror2Info]]
!Description
Enables syntax highlighting for <pre> and <code> blocks. Adds a new formatter for {{{<code class='???'>}}} 
!Usage
!!!!StyleSheet
<<<
*add this to your StyleSheet
{{{
[[codemirror.css]]
[[default.css]]
}}}
<<<
!!!!Macro
<<<
Modes: <<cmModes>> ... displays the initialized modes.
<<<
Modes: <<cmModes>>

<<<
MIMEs: <<cmMIMEs>> ... displays the initialized mime types. Same order as modes.
<<<
Modes: <<cmMIMEs>>
<<<
!!!!Global Settings
<<<
* have a look at: CodeMirror2Config
<<<
!!!!ViewTemplate
<<<
* Same as macro, but will be executed automatically for every tiddler. see: [[CodeMirror2Info]]
<<<
!!!!Parameters
<<<
{{{<<highlightSyntax [tagName]>> }}}
*will render all blocks, with any defined tag name. eg: tagName = code.
*[tagName] is optional. Default is "pre".
<<<
!!!!Configuration options
<<<
Guess syntax: <<option chkGuessSyntax>> .. If activated, ~TiddlyWiky <pre> blocks will be rendered according to there block braces. see [[CodeMirror2Info]]
Expert mode: <<option chkExpertSyntax>> .. If activated, additional values below will be used. see [[CodeMirror2Info]]

{{{ {{{ }}} txtShText: <<option txtShText>> eg: 'text + options'
{{{ /*{{{* / }}} txtShCss: <<option txtShCss>> eg: 'css  + options'
{{{ //{{{ }}} txtShPlugin: <<option txtShPlugin>> 'js  + options'
{{{ <!--{{{-->> }}} txtShXml: <<option txtShXml>> 'xml  + options'

Additional options ???????????????????
<<<
!!!!Revision History
<<<
* V 0.1.0 2011-09-05

<<<
!!!!ToDo
<<<
*
<<<
!!!Code
***/

//{{{
version.extensions.CodeMirror2Plugin = {major: 0, minor: 0, revision: 3, date: new Date(2011,9,03)};

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


config.macros.highlightSyntax = {
	getElementsByClass: function (searchClass,node,tag) {
		var classElements = [];
        if ( node == null ) node = document;
        if ( tag == null )  tag = '*';
		
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
	
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		// the configured tagName can be temporarily overwritten by the macro.
//		var tagName = params[0] || SyntaxHighlighter.config.tagName;
		var tagName = params[0] || 'pre';
		var arr = this.getElementsByClass('brush', story.findContainingTiddler(place), tagName);
		for (i=0; i<arr.length; i++) {
//			SyntaxHighlighter.highlight(null, arr[i]);
console.log('handler:' , arr);
//			CodeMirror.runMode(arr[i], 'javascript', output);
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
			if(config.browser.isIE)
				text = text.replace(/\n/g,"\r");
			var element = createTiddlyElement(w.output,this.element,null,options +' cm-s-default','');	// TODO check for theme
			
            CodeMirror.runMode(text, options, element);
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
		var expert = (co.chkExpertSyntax != undefined)? co.chkExpertSyntax : false;
		var guess  = (co.chkGuessSyntax != undefined)? co.chkGuessSyntax : true;
		
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE)
				text = text.replace(/\n/g,"\r");

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
		helper : {
			'true': true,
			'false': false,
			'null': null,
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
	conf['global'] = me.rdSettings(cm + secSep + 'global')

	// check CM for installed modes and get usre config if available
	modes = CodeMirror.listModes();
	for (var i=0; i < modes.length; i += 1) {
		conf[modes[i]] = me.rdSettings(cm + secSep + modes[i])
	}
	console.log({'config.tools.cm2.conf' : config.tools.cm2.conf})
})(jQuery);


//}}}
