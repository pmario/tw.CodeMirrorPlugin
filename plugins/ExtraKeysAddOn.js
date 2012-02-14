/***
|''Name''|ExtraKeysAddOn|
|''Description''|This AddOn contains the extra key handling for zCodeMirrorPlugin|
|''Author''|PMario|
|''Version''|0.1.0|
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
***/
//{{{

version.extensions.ExtraKeyAddOns = {
	major: 0,
	minor: 0,
	revision: 1,
	date: new Date(2012, 2, 7)
};

if (!config.tools) config.tools = {};
if (!config.tools.cm) config.tools.cm = {};
if (!config.tools.cm.addOns) config.tools.cm.addOns = {};

(function ($) {
    var me;
	config.tools.cm.addOns.toggleMaxHeight = me = {

		// sinze TW layout is very flexible, the actual hight for the editor viewport can be guessed only
		// formular used: window.height - title.h * 2 - toolbar.h * 2 - correction 
		// Editor scrolls into position, to be maximum visible.
		// TODO correction may be given by the user. eg cookie
		guessMaxHeight: function (corr) {
			var wh = $(window).height(),
				tih = ($('.title').height()) ? $('.title').height() : 0,
				toh = ($('.toolbar').height()) ? $('.toolbar').height() : 0;
				
			return wh - (tih + toh) * 2 - ((corr) ? corr : 0); 			
		},

		F11: function (ed) {
			var oldHeight, 
				$scroll,
				corr = 25;		// TODO make configurable
		
			$scroll = $(ed.getScrollerElement());
			oH = $scroll.data('oldHeight');

			if (!oH || oH == $scroll.height()) {
				$scroll.data('oldHeight', $scroll.height());
				$scroll.height(me.guessMaxHeight(corr));
				window.scrollTo(0,ensureVisible(ed.getScrollerElement())+1);	// +1 sucks
			}
			else {
				window.scrollTo(0,ensureVisible(ed.getScrollerElement())-1);	// -1 sucks
				$scroll.height(oH);
			}
			ed.refresh();
		}
	},
	
	// smartTab
	//	if _no_ text is selected, it inserts a tab char
	//	if text is selected, it indents the selected block
	config.tools.cm.addOns.smartTab = {
		Tab: function (instance) {
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
