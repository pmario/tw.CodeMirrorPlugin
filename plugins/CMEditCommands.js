/***
|''Name''|CMEditCommands|
|''Description''|Opens a tiddler in edit mode and starts CodeMirror editor.|
|''Version''|0.1.3|
|''Date''|2012-03-13|
|''Status''|''beta''|
|''Source''|https://github.com/pmario/tw.CodeMirrorPlugin|
|''License''|CC-BY-SA|
|''CoreVersion''|2.5|
|''Requires''|zCodeMirrorPlugin|
|''Keywords''|toolbar command code mirror codemirror edit|
!!!Description
<<<
To use this new toolbar command you have to add {{{cmEdit}}} to ToolbarCommands tiddler
eg:
{{{
|~ViewToolbar|tagSearch cmEdit +editTiddler  ...
}}}
<<<
!!! History
<<<
* V 0.1.3 2012-03-13
** Added functions to make editor height persistent.
** + bug fixes introduced with V 0.1.2
* V 0.1.1 
** Initial release
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
	// needed to get the original textarea dirty, after first time editing.
	var cmOnChange = function(cmEditor) {
		if (!cmEditor.dirty) {
			cmEditor.dirty = true;
			cmEditor.save();
		}
	};

	// readOnly can't be set by config tidder.
	// TODO onChange will need special handling. aka Hijacking if config also contains a onChange
	var cmOptions = {
		'readOnly': readOnly,
		onChange: cmOnChange
	};

	// define var shortcuts
	var cm = config.tools.cm;
	var conf = cm.conf;
	var tags = [], tl, mode;

	// read CodeMirrorConfig tiddler and write to global conf var
	cm.init();
	
	var modes = CodeMirror.listModes();
	
	// TODO post to mailing list about it ?! It makes handling the library more difficult.
	var mimes = cm.listMimeNames();
		
	// doesn't set tid if title is a shadow tiddler
	var tid = store.getTiddler(title);

	// set global settings
	jQuery.extend(cmOptions, conf['global']);

	// shadow tiddlers don't have tags, fields ...
	if (tid && tid.fields) {		

		if (tid.fields['server.content-type'] && mimes.contains(tid.fields['server.content-type'])) {
			mode = cm.getModeObject(tid.fields['server.content-type']);
			jQuery.extend(cmOptions, conf[mode.name]);
			jQuery.extend(cmOptions.mode, mode);
		}
		
		if (tid.fields['content-type'] && mimes.contains(tid.fields['content-type'])) {
			mode = cm.getModeObject(tid.fields['content-type']);
			jQuery.extend(cmOptions, conf[mode.name]);
			jQuery.extend(cmOptions.mode, mode);
		}
		
		for (var i=0; i < modes.length; i += 1) {
			if (conf[modes[i]] && conf[modes[i]].tags) {
				tags = conf[modes[i]].tags.split(' ');
				tl = tags.length;
			
				// there is no need to know, which tag, was the one, that was found.
				// it's important, that one was found.
				for (var j=0; j < tid.tags.length; j += 1) {
					tags.pushUnique(tid.tags[j]);
				}

				// if one tag is the same, pushUnique above will eliminate one or more tags.
				if ((tl + tid.tags.length) != tags.length) {
					jQuery.extend(cmOptions, conf[modes[i]]);
					break;	// modes.length loop. first found wins.
				}					
			} // if 
		} // for
		if (tid.fields['cm.height']) {
			jQuery.extend(cmOptions, {cmHeight: tid.fields['cm.height']});
		}	// TODO TypeChooser and cmEdit should use the same functions. refactoring needed.
	} // if tid
	
	// if no mode was found, init with null -> text/plain
	if (!cmOptions.mode) {
		jQuery.extend(cmOptions, conf['null']);
	}
	// call the TW default editor	
	config.commands.editTiddler.handler.call(this,event,src,title); 

	// find the default editor
	var textArea = jQuery(story.getTiddler(title)).find('textarea[edit=text]');
		
	// create the cm editor
	cm.startEditor(textArea, cmOptions);
	return false;
};

config.commands.cmSave.handler = function(event,src,title)
{
	var text = jQuery(story.getTiddler(title)).find('textarea[edit=text]');
	var editor = jQuery(text[0]).data('editor');

	if (editor) {editor.save();}
	
	config.commands.saveTiddler.handler.call(this,event,src,title); 
	return false;
};

//}}}
