/***
|''Name''|CMEditCommands|
|''Description''|Opens a tiddler in edit mode and starts CodeMirror editor.|
|''Version''|0.0.1|
|''Date''|2011-09-01|
|''Status''|@@experimental@@|
|''Source''||
|''License''|CC-BY-SA|
|''CoreVersion''|2.5|
|''Keywords''|toolbar command code mirror codemirror edit|
!!!Description
<<<
To use this new toolbar command you have to add {{{cmEdit}}} to ToolbarCommands tiddler
eg:
{{{
|~ViewToolbar|tagSearch cmEdit +editTiddler  ...
}}}
<<<

!!!Code
***/
//{{{

config.commands.cmEdit = {
	text: "cmEdit",
	tooltip: "Edit tiddler with CodeMirror editor!",

	readOnlyText: "view",
	readOnlyTooltip: "View the source of this tiddler using CodeMirror"
};

config.commands.cmSave = {
	text: "cmSave",
	tooltip: "Save tiddler, when CodeMirror editor is used!",

	isEnabled: function(tiddler) {
		return (!readOnly);
	}	
};

config.commands.cmEdit.handler = function(event,src,title)
{
	// needed to get the original textarea dirty.
	var cmOnChange = function(cmEditor) {
		if (!cmEditor.dirty) {
			cmEditor.dirty = true;
			cmEditor.save();
		}
	};

	var cmOptions = {
		enterMode: 'keep',		// (d) 'indent' || 'keep' || 'flat'
		indentWithTabs: true,	// (d) false

		lineNumbers: true,
		matchBrackets: true,
		mode:  "javascript",		//TODO needs to depend on source type ...
				
		'readOnly': readOnly,
		onChange: cmOnChange
	}

	config.commands.editTiddler.handler.call(this,event,src,title); 

	var text = jQuery(story.getTiddler(title)).find('textarea[edit=text]');

	var editor = CodeMirror.fromTextArea(text[0], cmOptions);

	jQuery(text[0]).data('editor', editor);
	
	return false;
};

config.commands.cmSave.handler = function(event,src,title)
{
	var text = jQuery(story.getTiddler(title)).find('textarea[edit=text]');
	var editor = jQuery(text[0]).data('editor');

	if (editor) editor.save();
	
	config.commands.saveTiddler.handler.call(this,event,src,title); 
	
	return false;
};

//}}}
