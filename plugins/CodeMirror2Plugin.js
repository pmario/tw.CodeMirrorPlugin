/***
|''Name''|CodeMirror2Plugin|
|''Description''|This plugin is a wrapper for the CodeMirror2 library|
|''Author''|Mario Pietsch|
|''Version''|0.0.1|
|''Date''|2011.08.31|
|''Status''|<@@experimental@@|
|''CodeRepository''|https://github.com/pmario/tw.CodeMirrorPlugin|
|''License''|[[CC-BY-SA|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Keywords''|syntx highlighting editor code mirror|
!!!Usage
<<<
{{{
<<codeMirror>>
}}}
< <helloWorldButton>>
{{{
<<helloWorldButton 'some button text'>>
}}}
< <helloWorldButton 'some button text'>>
<<<
!!!Note
<<<
.....
<<<
***/
//{{{

version.extensions.CodeMirror2Plugin = {major: 0, minor: 0, revision: 1, date: new Date(2011,8,31)};

(function ($) {

var me;	// used as a shortcut for config.macros.helloWorld 
		// most of the times this could be used instead.

config.macros.helloWorldButton = me = {

	// should be done for easy localisation
	locale: {
		lblButton: "Hello World",
		txtTooltip: "Click me!",
		txtHelloWorld: "Hello World",
		txtDataText: "jQuery data text is: %0",
		txtDataVal: "jQuery data value is: %0",
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler){
		var btn = null;
		var btnText = params[0] || me.locale.lblButton;

		// next line is only used as a reminder
		// createTiddlyButton(parent, text, tooltip, action, className, id, accessKey, attribs)			
		btn = createTiddlyButton(place, btnText, me.locale.txtTooltip, me.onClick, 'button', 'btnHelloWorld');

		// adding a jQuery data object to the button 
		var result = $(btn).data('data', {'text': 'some text', 'val': 10});
		// console.log(result);
	},

	onClick: function() {
		var data = $(this).data("data");
 
		alert(	me.locale.txtHelloWorld + '\n' +
			me.locale.txtDataText.format([data.text]) + '\n' +
			me.locale.txtDataVal.format([data.val]) + '\n'
			);
	}

}; // end of hello world

}) (jQuery);
//}}}

