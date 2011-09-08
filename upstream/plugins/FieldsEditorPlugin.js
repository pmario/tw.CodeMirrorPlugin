/***
|''Name:''|FieldsEditorPlugin|
|''Description:''|//create//, //edit//, //view// and //delete// commands in toolbar <<toolbar fields>>.|
|''Version:''|1.0.2|
|''Date:''|Dec 21,2007|
|''Source:''|http://visualtw.ouvaton.org/VisualTW.html|
|''Author:''|Pascal Collin|
|''License:''|[[BSD open source license|License]]|
|''~CoreVersion:''|2.2.0|
|''Browser:''|Firefox 2.0; InternetExplorer 6.0, others|
!Demo:
On [[homepage|http://visualtw.ouvaton.org/VisualTW.html]], see [[FieldEditor example]]
!Installation:
*import this tiddler from [[homepage|http://visualtw.ouvaton.org/VisualTW.html]] (tagged as systemConfig)
*save and reload
*optionnaly : add the following css text in your StyleSheet : {{{#popup tr.fieldTableRow td {padding:1px 3px 1px 3px;}}}
!Code
***/

//{{{

config.commands.fields.handlePopup = function(popup,title) {
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return;
	var fields = {};
	store.forEachField(tiddler,function(tiddler,fieldName,value) {fields[fieldName] = value;},true);
	var items = [];
	for(var t in fields) {
		var editCommand = "<<untiddledCall editFieldDialog "+escape(title)+" "+escape(t)+">>";
		var deleteCommand = "<<untiddledCall deleteField "+escape(title)+" "+escape(t)+">>";
		var renameCommand = "<<untiddledCall renameField "+escape(title)+" "+escape(t)+">>";
		items.push({field: t,value: fields[t], actions: editCommand+renameCommand+deleteCommand});
	}
	items.sort(function(a,b) {return a.field < b.field ? -1 : (a.field == b.field ? 0 : +1);});
	var createNewCommand = "<<untiddledCall createField "+escape(title)+">>";
	items.push({field : "", value : "", actions:createNewCommand });
	if(items.length > 0)
		ListView.create(popup,items,this.listViewTemplate);
	else
		createTiddlyElement(popup,"div",null,null,this.emptyText);
}

config.commands.fields.listViewTemplate = {
	columns: [
		{name: 'Field', field: 'field', title: "Field", type: 'String'},
		{name: 'Actions', field: 'actions', title: "Actions", type: 'WikiText'},
		{name: 'Value', field: 'value', title: "Value", type: 'WikiText'}
	],
	rowClasses: [
			{className: 'fieldTableRow', field: 'actions'}
	],
	buttons: [	//can't use button for selected then delete, because click on checkbox will hide the popup
	]
}

config.macros.untiddledCall = {  // when called from listview, tiddler is unset, so we need to pass tiddler as parameter
	handler : function(place,macroName,params,wikifier,paramString) {
		var macroName = params.shift();
		if (macroName) var macro = config.macros[macroName];
		var title = params.shift();
		if (title) var tiddler = store.getTiddler(unescape(title));
		if (macro) macro.handler(place,macroName,params,wikifier,paramString,tiddler);		
	}
}

config.macros.deleteField = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if(!readOnly && params[0]) {
			fieldName = unescape(params[0]);
			var btn = createTiddlyButton(place,"delete", "delete "+fieldName,this.onClickDeleteField);
			btn.setAttribute("title",tiddler.title);
			btn.setAttribute("fieldName", fieldName);
		}
	},
	onClickDeleteField : function() {
		var title=this.getAttribute("title");
		var fieldName=this.getAttribute("fieldName");
		var tiddler = store.getTiddler(title);
		if (tiddler && fieldName && confirm("delete field " + fieldName+" from " + title +" tiddler ?")) {
			delete tiddler.fields[fieldName];
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
			story.refreshTiddler(title,"ViewTemplate",true);
		}
		return false;
	}
}

config.macros.createField = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if(!readOnly) {
			var btn = createTiddlyButton(place,"create new", "create a new field",this.onClickCreateField);
			btn.setAttribute("title",tiddler.title);
		}
	},
	onClickCreateField : function() {
		var title=this.getAttribute("title");
		var tiddler = store.getTiddler(title);
		if (tiddler) {
			var fieldName = prompt("Field name","");
			if (store.getValue(tiddler,fieldName)) {
				window.alert("This field already exists.");
			}
			else if (fieldName) {
				var v = prompt("Field value","");
				tiddler.fields[fieldName]=v;
				store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
				story.refreshTiddler(title,"ViewTemplate",true);
			}
		}
		return false;
	}
}

config.macros.editFieldDialog = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if(!readOnly && params[0]) {
			fieldName = unescape(params[0]);
			var btn = createTiddlyButton(place,"edit", "edit this field",this.onClickEditFieldDialog);
			btn.setAttribute("title",tiddler.title);
			btn.setAttribute("fieldName", fieldName);
		}
	},
	onClickEditFieldDialog : function() {
		var title=this.getAttribute("title");
		var tiddler = store.getTiddler(title);
		var fieldName=this.getAttribute("fieldName");
		if (tiddler && fieldName) {
			var value = tiddler.fields[fieldName];
			value = value ? value : "";
			var lines = value.match(/\n/mg);
			lines = lines ? true : false;
			if (!lines || confirm("This field contains more than one line. Only the first line will be kept if you edit it here. Proceed ?")) {
				var v = prompt("Field value",value);
				tiddler.fields[fieldName]=v;
				store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
				story.refreshTiddler(title,"ViewTemplate",true);
			}
		}
		return false;
	}
}

config.macros.renameField = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if(!readOnly && params[0]) {
			fieldName = unescape(params[0]);
			var btn = createTiddlyButton(place,"rename", "rename "+fieldName,this.onClickRenameField);
			btn.setAttribute("title",tiddler.title);
			btn.setAttribute("fieldName", fieldName);
		}
	},
	onClickRenameField : function() {
		var title=this.getAttribute("title");
		var fieldName=this.getAttribute("fieldName");
		var tiddler = store.getTiddler(title);
		if (tiddler && fieldName) {
			var newName = prompt("Rename " + fieldName + " as ?", fieldName);
			if (newName) {
				tiddler.fields[newName]=tiddler.fields[fieldName];
				delete tiddler.fields[fieldName];
				store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
				story.refreshTiddler(title,"ViewTemplate",true);
			}
		}
		return false;
	}
}

config.shadowTiddlers.StyleSheetFieldsEditor = "/*{{{*/\n";
config.shadowTiddlers.StyleSheetFieldsEditor += ".fieldTableRow td {padding : 1px 3px}\n";
config.shadowTiddlers.StyleSheetFieldsEditor += ".fieldTableRow .button {border:0; padding : 0 0.2em}\n";
config.shadowTiddlers.StyleSheetFieldsEditor +="/*}}}*/";
store.addNotification("StyleSheetFieldsEditor", refreshStyles);

//}}}
