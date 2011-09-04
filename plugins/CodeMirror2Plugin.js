/***
|''Name''|CodeMirror2Plugin|
|''Description''|Enables syntax highlighting using CodeMirror2|
|''Author''|PMario|
|''Version''|0.0.2|
|''Status''|''experimental''|
|''Source''||
|''License''|CC-BY-SA|
|''CoreVersion''|2.5.0|
|''Requires''|codemirror.js runmode.js|
|''Keywords''|syntax highlighting color code mirror codemirror|
!Documentation
*see: [[CodeMirror2Info]]
!Description
Enables syntax highlighting for <pre> and <code> blocks. Adds a new formatter for {{{<code class='brush:???'>}}} 
!Usage
!!!!StyleSheet
<<<
*add this to your StyleSheet
{{{
[[ShCore.css]]
[[ShThemeDefault.css]]
}}}
<<<
!!!!Macro
<<<
*The macro is only needed if you have inline html blocks. see: [[SyntaxHighlighterPlugin3Info]]
<<<
!!!!ViewTemplate
<<<
*Same as macro, but will be executed automatically for every tiddler. see: [[SyntaxHighlighterPlugin3Info]]
<<<
!!!!Parameters
<<<
{{{<<highlightSyntax [tagName]>> }}}
*will render all blocks, with any defined tag name. eg: tagName = code.
*[tagName] is optional. Default is "pre".
<<<
!!!!Configuration options
<<<
Guess syntax: <<option chkGuessSyntax>> .. If activated, ~TiddlyWiky <pre> blocks will be rendered according to there block braces. see [[SyntaxHighlighterPlugin3Info]]
Expert mode: <<option chkExpertSyntax>> .. If activated, additional values below will be used. see [[SyntaxHighlighterPlugin3Info]]

{{{ {{{ }}} txtShText: <<option txtShText>> eg: 'brush:text tab-size:4 + options'
{{{ /*{{{* / }}} txtShCss: <<option txtShCss>> eg: 'brush:css  + options'
{{{ //{{{ }}} txtShPlugin: <<option txtShPlugin>> 'brush:js  + options'
{{{ <!--{{{-->> }}} txtShXml: <<option txtShXml>> 'brush:xml  + options'

Additional options can be found at: [[SyntaxHighlighter homepage|http://alexgorbatchev.com/SyntaxHighlighter/manual/configuration/]]
<<<
!!!!Revision History
<<<
*V 0.2.0 2010-08-22
**New formatter for {{{<code class='brush:???'>}}} is available now
**expert mode uses config options now
<<<
!!!!ToDo
<<<
*
<<<
!!!Code
***/

//{{{
version.extensions.CodeMirror2Plugin = {major: 0, minor: 0, revision: 2, date: new Date(2011,9,02)};

(function($) {

if(!window.CodeMirror) {
	throw "Missing dependency: CodeMirror";
}
else if(!window.CodeMirror.runMode) {
	throw "Missing dependency: CodeMirror-runmode library";
}


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
			var element = createTiddlyElement(w.output,this.element,null,options +' cm-s-default','');
			
			console.log('code:', 'options:', options);

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
				attr = (expert) ? (co.txtShText) ? (co.txtShText) : 'brush:text' : 'brush:text' ;
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
			var element = createTiddlyElement(w.output,this.element,null,' cm-s-default','');		
	        if (guess || expert) {
	        	console.log(text, attr, element);
				CodeMirror.runMode(text, attr, element);
//	        	SyntaxHighlighter.highlight(null, element);
	        }

			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	};
	// merge the new helper function into formatterHelpers. 
	merge(config.formatterHelpers, helper);

})(config.formatters); //# end of alias
//}}}
