/***
|''Name''|ExtraKeysAddOn|
|''Description''|This AddOn contains the extra key handling for zCodeMirrorPlugin|
|''Author''|PMario|
|''Version''|0.1.3|
|''Status''|''beta''|
|''Source''|http://codemirror-plugins.tiddlyspace.com/#RenderBuffer.js|
|''License''|[[CC by-nc-sa 3.0|http://creativecommons.org/licenses/by-nc-sa/3.0/]]|
|''CoreVersion''|2.5.0|
|''Keywords''|TAB key handling |
! Documentation
<<<
This addOn needs to be used together with [[zCodeMirrorPlugin]]. It contains:
* simpleTab
** If TAB key is pressed, it just inserts a tab. 
** If some text is selected the text will be deleted and a tab will be inserted.
* smartTab
** If no text is selected it inserts a tab.
** If some text or some lines are selected the selected lines will be indented by one tab.
** If text is selected <shift><tab> will unindent the selected lines. This behaviour is preferred, for programming.
* Using {{{simpleTab}}} or {{{smartTab}}} can be configured at CodeMirrorConfig tiddler.
** Default is .. {{{ extraKeys: smartTab }}}
* <F11> key toggles the editor height.
<<<
! Important
<<<
The option {{{chkInsertTabs}}} needs to be ''unchecked'' to use {{{smartTab}}} handling.
<<option chkInsertTabs>> {{{chkInsertTabs}}} Use the tab key to insert tab characters instead of moving between fields.
<<<
! History
<<<
* V 0.1.3 2012-06-33
** Updated "shift-tab" handling for "smartTab" mode.
* V 0.1.2 2012-03-13
** Added functions to make editor height persistent.
** + bug fixes introduce with V 0.1.1
<<<
***/
//{{{

version.extensions.ExtraKeyAddOns = {
	major: 0,
	minor: 0,
	revision: 1,
	date: new Date(2012, 6, 23)
};

// Returns the specified field (input or textarea element) in a tiddler
// or null if it found no field 
Story.prototype.hasTiddlerField = function(title,field)
{
	var tiddlerElem = this.getTiddler(title);
	var e = null;
	if(tiddlerElem) {
		var t,children = tiddlerElem.getElementsByTagName("*");
		for(t=0; t<children.length; t++) {
			var c = children[t];
			if(c.tagName.toLowerCase() == "input" || c.tagName.toLowerCase() == "textarea") {
				if(c.getAttribute("edit") == field)
					e = c;
			}
		}
	}
	return e;
};

if (!config.tools) config.tools = {};
if (!config.tools.cm) config.tools.cm = {};
if (!config.tools.cm.addOns) config.tools.cm.addOns = {};

(function ($) {

    var me;
	config.tools.cm.addOns.toggleMaxHeight = me = {

		F11: function (ed) {		
			var oldHeight, 
				$scroll,
				tidEl = story.findContainingTiddler(ed.getWrapperElement()),
				cmHeight,
				corr = 25;		// TODO make configurable

			$scroll = $(ed.getScrollerElement());
			oH = $scroll.data('oldHeight');
			if (!oH || oH == $scroll.height()) {
				$scroll.data('oldHeight', $scroll.height());
				$scroll.height(config.tools.cm.guessMaxHeight(corr));
				window.scrollTo(0,ensureVisible(ed.getScrollerElement())+1); // +1 sucks but I want to see the border!
				cmHeight = 'max';
			}
			else {
				window.scrollTo(0,ensureVisible(ed.getScrollerElement())-1); // -1 sucks
				$scroll.height(oH);
				cmHeight = 'min';
			}
			var title = tidEl.getAttribute('tiddler');

			var f = story.hasTiddlerField(title,'cm.height'); 
			if (!f ) {
				story.addCustomFields(tidEl, 'cm.height:'+cmHeight);
			}
			else {
				f.setAttribute('value', cmHeight);		
			}
			ed.refresh();
		}
	},
	
	// smartTab
	//	if _no_ text is selected, it inserts a tab char
	//	if text is selected, it indents the selected block
	config.tools.cm.addOns.smartTab = {
		"Shift-Tab": function (instance) {
			CodeMirror.commands.indentLess(instance);
		},

		"Tab": function (instance) {
			if (instance.somethingSelected())
				CodeMirror.commands.indentMore(instance);
			else
				CodeMirror.commands.insertTab(instance);
		}
	}, // end plugin

	// simpleTab
	//	if _no_ text is selected, it inserts a tab char
	//	if text is selected, it _deletes_ the selected block and inserts a tab char
	config.tools.cm.addOns.simpleTab = {
		Tab: "insertTab"
	}	
	
})(jQuery);

//}}}
