/***
|''Name:''|UploadPlugin|
|''Description:''|Save to web a TiddlyWiki|
|''Version:''|4.1.3|
|''Date:''|Feb 24, 2008|
|''Source:''|http://tiddlywiki.bidix.info/#UploadPlugin|
|''Documentation:''|http://tiddlywiki.bidix.info/#UploadPluginDoc|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0|
|''Requires:''|PasswordOptionPlugin|
***/
//{{{
version.extensions.UploadPlugin = {
	major: 4, minor: 1, revision: 3,
	date: new Date("Feb 24, 2008"),
	source: 'http://tiddlywiki.bidix.info/#UploadPlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	coreVersion: '2.2.0'
};

//
// Environment
//

if (!window.bidix) window.bidix = {}; // bidix namespace
bidix.debugMode = false;	// true to activate both in Plugin and UploadService
	
//
// Upload Macro
//

config.macros.upload = {
// default values
	defaultBackupDir: '',	//no backup
	defaultStoreScript: "store.php",
	defaultToFilename: "index.html",
	defaultUploadDir: ".",
	authenticateUser: true	// UploadService Authenticate User
};
	
config.macros.upload.label = {
	promptOption: "Save and Upload this TiddlyWiki with UploadOptions",
	promptParamMacro: "Save and Upload this TiddlyWiki in %0",
	saveLabel: "save to web", 
	saveToDisk: "save to disk",
	uploadLabel: "upload"	
};

config.macros.upload.messages = {
	noStoreUrl: "No store URL in parmeters or options",
	usernameOrPasswordMissing: "Username or password missing"
};

config.macros.upload.handler = function(place,macroName,params) {
	if (readOnly)
		return;
	var label;
	if (document.location.toString().substr(0,4) == "http") 
		label = this.label.saveLabel;
	else
		label = this.label.uploadLabel;
	var prompt;
	if (params[0]) {
		prompt = this.label.promptParamMacro.toString().format([this.destFile(params[0], 
			(params[1] ? params[1]:bidix.basename(window.location.toString())), params[3])]);
	} else {
		prompt = this.label.promptOption;
	}
	createTiddlyButton(place, label, prompt, function() {config.macros.upload.action(params);}, null, null, this.accessKey);
};

config.macros.upload.action = function(params)
{
		// for missing macro parameter set value from options
		if (!params) params = {};
		var storeUrl = params[0] ? params[0] : config.options.txtUploadStoreUrl;
		var toFilename = params[1] ? params[1] : config.options.txtUploadFilename;
		var backupDir = params[2] ? params[2] : config.options.txtUploadBackupDir;
		var uploadDir = params[3] ? params[3] : config.options.txtUploadDir;
		var username = params[4] ? params[4] : config.options.txtUploadUserName;
		var password = config.options.pasUploadPassword; // for security reason no password as macro parameter	
		// for still missing parameter set default value
		if ((!storeUrl) && (document.location.toString().substr(0,4) == "http")) 
			storeUrl = bidix.dirname(document.location.toString())+'/'+config.macros.upload.defaultStoreScript;
		if (storeUrl.substr(0,4) != "http")
			storeUrl = bidix.dirname(document.location.toString()) +'/'+ storeUrl;
		if (!toFilename)
			toFilename = bidix.basename(window.location.toString());
		if (!toFilename)
			toFilename = config.macros.upload.defaultToFilename;
		if (!uploadDir)
			uploadDir = config.macros.upload.defaultUploadDir;
		if (!backupDir)
			backupDir = config.macros.upload.defaultBackupDir;
		// report error if still missing
		if (!storeUrl) {
			alert(config.macros.upload.messages.noStoreUrl);
			clearMessage();
			return false;
		}
		if (config.macros.upload.authenticateUser && (!username || !password)) {
			alert(config.macros.upload.messages.usernameOrPasswordMissing);
			clearMessage();
			return false;
		}
		bidix.upload.uploadChanges(false,null,storeUrl, toFilename, uploadDir, backupDir, username, password); 
		return false; 
};

config.macros.upload.destFile = function(storeUrl, toFilename, uploadDir) 
{
	if (!storeUrl)
		return null;
		var dest = bidix.dirname(storeUrl);
		if (uploadDir && uploadDir != '.')
			dest = dest + '/' + uploadDir;
		dest = dest + '/' + toFilename;
	return dest;
};

//
// uploadOptions Macro
//

config.macros.uploadOptions = {
	handler: function(place,macroName,params) {
		var wizard = new Wizard();
		wizard.createWizard(place,this.wizardTitle);
		wizard.addStep(this.step1Title,this.step1Html);
		var markList = wizard.getElement("markList");
		var listWrapper = document.createElement("div");
		markList.parentNode.insertBefore(listWrapper,markList);
		wizard.setValue("listWrapper",listWrapper);
		this.refreshOptions(listWrapper,false);
		var uploadCaption;
		if (document.location.toString().substr(0,4) == "http") 
			uploadCaption = config.macros.upload.label.saveLabel;
		else
			uploadCaption = config.macros.upload.label.uploadLabel;
		
		wizard.setButtons([
				{caption: uploadCaption, tooltip: config.macros.upload.label.promptOption, 
					onClick: config.macros.upload.action},
				{caption: this.cancelButton, tooltip: this.cancelButtonPrompt, onClick: this.onCancel}
				
			]);
	},
	options: [
		"txtUploadUserName",
		"pasUploadPassword",
		"txtUploadStoreUrl",
		"txtUploadDir",
		"txtUploadFilename",
		"txtUploadBackupDir",
		"chkUploadLog",
		"txtUploadLogMaxLine"		
	],
	refreshOptions: function(listWrapper) {
		var opts = [];
		for(i=0; i<this.options.length; i++) {
			var opt = {};
			opts.push();
			opt.option = "";
			n = this.options[i];
			opt.name = n;
			opt.lowlight = !config.optionsDesc[n];
			opt.description = opt.lowlight ? this.unknownDescription : config.optionsDesc[n];
			opts.push(opt);
		}
		var listview = ListView.create(listWrapper,opts,this.listViewTemplate);
		for(n=0; n<opts.length; n++) {
			var type = opts[n].name.substr(0,3);
			var h = config.macros.option.types[type];
			if (h && h.create) {
				h.create(opts[n].colElements['option'],type,opts[n].name,opts[n].name,"no");
			}
		}
		
	},
	onCancel: function(e)
	{
		backstage.switchTab(null);
		return false;
	},
	
	wizardTitle: "Upload with options",
	step1Title: "These options are saved in cookies in your browser",
	step1Html: "<input type='hidden' name='markList'></input><br>",
	cancelButton: "Cancel",
	cancelButtonPrompt: "Cancel prompt",
	listViewTemplate: {
		columns: [
			{name: 'Description', field: 'description', title: "Description", type: 'WikiText'},
			{name: 'Option', field: 'option', title: "Option", type: 'String'},
			{name: 'Name', field: 'name', title: "Name", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'} 
			]}
};

//
// upload functions
//

if (!bidix.upload) bidix.upload = {};

if (!bidix.upload.messages) bidix.upload.messages = {
	//from saving
	invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
	backupSaved: "Backup saved",
	backupFailed: "Failed to upload backup file",
	rssSaved: "RSS feed uploaded",
	rssFailed: "Failed to upload RSS feed file",
	emptySaved: "Empty template uploaded",
	emptyFailed: "Failed to upload empty template file",
	mainSaved: "Main TiddlyWiki file uploaded",
	mainFailed: "Failed to upload main TiddlyWiki file. Your changes have not been saved",
	//specific upload
	loadOriginalHttpPostError: "Can't get original file",
	aboutToSaveOnHttpPost: 'About to upload on %0 ...',
	storePhpNotFound: "The store script '%0' was not found."
};

bidix.upload.uploadChanges = function(onlyIfDirty,tiddlers,storeUrl,toFilename,uploadDir,backupDir,username,password)
{
	var callback = function(status,uploadParams,original,url,xhr) {
		if (!status) {
			displayMessage(bidix.upload.messages.loadOriginalHttpPostError);
			return;
		}
		if (bidix.debugMode) 
			alert(original.substr(0,500)+"\n...");
		// Locate the storeArea div's 
		var posDiv = locateStoreArea(original);
		if((posDiv[0] == -1) || (posDiv[1] == -1)) {
			alert(config.messages.invalidFileError.format([localPath]));
			return;
		}
		bidix.upload.uploadRss(uploadParams,original,posDiv);
	};
	
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	// save on localdisk ?
	if (document.location.toString().substr(0,4) == "file") {
		var path = document.location.toString();
		var localPath = getLocalPath(path);
		saveChanges();
	}
	// get original
	var uploadParams = new Array(storeUrl,toFilename,uploadDir,backupDir,username,password);
	var originalPath = document.location.toString();
	// If url is a directory : add index.html
	if (originalPath.charAt(originalPath.length-1) == "/")
		originalPath = originalPath + "index.html";
	var dest = config.macros.upload.destFile(storeUrl,toFilename,uploadDir);
	var log = new bidix.UploadLog();
	log.startUpload(storeUrl, dest, uploadDir,  backupDir);
	displayMessage(bidix.upload.messages.aboutToSaveOnHttpPost.format([dest]));
	if (bidix.debugMode) 
		alert("about to execute Http - GET on "+originalPath);
	var r = doHttp("GET",originalPath,null,null,username,password,callback,uploadParams,null);
	if (typeof r == "string")
		displayMessage(r);
	return r;
};

bidix.upload.uploadRss = function(uploadParams,original,posDiv) 
{
	var callback = function(status,params,responseText,url,xhr) {
		if(status) {
			var destfile = responseText.substring(responseText.indexOf("destfile:")+9,responseText.indexOf("\n", responseText.indexOf("destfile:")));
			displayMessage(bidix.upload.messages.rssSaved,bidix.dirname(url)+'/'+destfile);
			bidix.upload.uploadMain(params[0],params[1],params[2]);
		} else {
			displayMessage(bidix.upload.messages.rssFailed);			
		}
	};
	// do uploadRss
	if(config.options.chkGenerateAnRssFeed) {
		var rssPath = uploadParams[1].substr(0,uploadParams[1].lastIndexOf(".")) + ".xml";
		var rssUploadParams = new Array(uploadParams[0],rssPath,uploadParams[2],'',uploadParams[4],uploadParams[5]);
		var rssString = generateRss();
		// no UnicodeToUTF8 conversion needed when location is "file" !!!
		if (document.location.toString().substr(0,4) != "file")
			rssString = convertUnicodeToUTF8(rssString);	
		bidix.upload.httpUpload(rssUploadParams,rssString,callback,Array(uploadParams,original,posDiv));
	} else {
		bidix.upload.uploadMain(uploadParams,original,posDiv);
	}
};

bidix.upload.uploadMain = function(uploadParams,original,posDiv) 
{
	var callback = function(status,params,responseText,url,xhr) {
		var log = new bidix.UploadLog();
		if(status) {
			// if backupDir specified
			if ((params[3]) && (responseText.indexOf("backupfile:") > -1))  {
				var backupfile = responseText.substring(responseText.indexOf("backupfile:")+11,responseText.indexOf("\n", responseText.indexOf("backupfile:")));
				displayMessage(bidix.upload.messages.backupSaved,bidix.dirname(url)+'/'+backupfile);
			}
			var destfile = responseText.substring(responseText.indexOf("destfile:")+9,responseText.indexOf("\n", responseText.indexOf("destfile:")));
			displayMessage(bidix.upload.messages.mainSaved,bidix.dirname(url)+'/'+destfile);
			store.setDirty(false);
			log.endUpload("ok");
		} else {
			alert(bidix.upload.messages.mainFailed);
			displayMessage(bidix.upload.messages.mainFailed);
			log.endUpload("failed");			
		}
	};
	// do uploadMain
	var revised = bidix.upload.updateOriginal(original,posDiv);
	bidix.upload.httpUpload(uploadParams,revised,callback,uploadParams);
};

bidix.upload.httpUpload = function(uploadParams,data,callback,params)
{
	var localCallback = function(status,params,responseText,url,xhr) {
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		if (xhr.status == 404)
			alert(bidix.upload.messages.storePhpNotFound.format([url]));
		if ((bidix.debugMode) || (responseText.indexOf("Debug mode") >= 0 )) {
			alert(responseText);
			if (responseText.indexOf("Debug mode") >= 0 )
				responseText = responseText.substring(responseText.indexOf("\n\n")+2);
		} else if (responseText.charAt(0) != '0') 
			alert(responseText);
		if (responseText.charAt(0) != '0')
			status = null;
		callback(status,params,responseText,url,xhr);
	};
	// do httpUpload
	var boundary = "---------------------------"+"AaB03x";	
	var uploadFormName = "UploadPlugin";
	// compose headers data
	var sheader = "";
	sheader += "--" + boundary + "\r\nContent-disposition: form-data; name=\"";
	sheader += uploadFormName +"\"\r\n\r\n";
	sheader += "backupDir="+uploadParams[3] +
				";user=" + uploadParams[4] +
				";password=" + uploadParams[5] +
				";uploaddir=" + uploadParams[2];
	if (bidix.debugMode)
		sheader += ";debug=1";
	sheader += ";;\r\n"; 
	sheader += "\r\n" + "--" + boundary + "\r\n";
	sheader += "Content-disposition: form-data; name=\"userfile\"; filename=\""+uploadParams[1]+"\"\r\n";
	sheader += "Content-Type: text/html;charset=UTF-8" + "\r\n";
	sheader += "Content-Length: " + data.length + "\r\n\r\n";
	// compose trailer data
	var strailer = new String();
	strailer = "\r\n--" + boundary + "--\r\n";
	data = sheader + data + strailer;
	if (bidix.debugMode) alert("about to execute Http - POST on "+uploadParams[0]+"\n with \n"+data.substr(0,500)+ " ... ");
	var r = doHttp("POST",uploadParams[0],data,"multipart/form-data; ;charset=UTF-8; boundary="+boundary,uploadParams[4],uploadParams[5],localCallback,params,null);
	if (typeof r == "string")
		displayMessage(r);
	return r;
};

// same as Saving's updateOriginal but without convertUnicodeToUTF8 calls
bidix.upload.updateOriginal = function(original, posDiv)
{
	if (!posDiv)
		posDiv = locateStoreArea(original);
	if((posDiv[0] == -1) || (posDiv[1] == -1)) {
		alert(config.messages.invalidFileError.format([localPath]));
		return;
	}
	var revised = original.substr(0,posDiv[0] + startSaveArea.length) + "\n" +
				store.allTiddlersAsHtml() + "\n" +
				original.substr(posDiv[1]);
	var newSiteTitle = getPageTitle().htmlEncode();
	revised = revised.replaceChunk("<title"+">","</title"+">"," " + newSiteTitle + " ");
	revised = updateMarkupBlock(revised,"PRE-HEAD","MarkupPreHead");
	revised = updateMarkupBlock(revised,"POST-HEAD","MarkupPostHead");
	revised = updateMarkupBlock(revised,"PRE-BODY","MarkupPreBody");
	revised = updateMarkupBlock(revised,"POST-SCRIPT","MarkupPostBody");
	return revised;
};

//
// UploadLog
// 
// config.options.chkUploadLog :
//		false : no logging
//		true : logging
// config.options.txtUploadLogMaxLine :
//		-1 : no limit
//      0 :  no Log lines but UploadLog is still in place
//		n :  the last n lines are only kept
//		NaN : no limit (-1)

bidix.UploadLog = function() {
	if (!config.options.chkUploadLog) 
		return; // this.tiddler = null
	this.tiddler = store.getTiddler("UploadLog");
	if (!this.tiddler) {
		this.tiddler = new Tiddler();
		this.tiddler.title = "UploadLog";
		this.tiddler.text = "| !date | !user | !location | !storeUrl | !uploadDir | !toFilename | !backupdir | !origin |";
		this.tiddler.created = new Date();
		this.tiddler.modifier = config.options.txtUserName;
		this.tiddler.modified = new Date();
		store.addTiddler(this.tiddler);
	}
	return this;
};

bidix.UploadLog.prototype.addText = function(text) {
	if (!this.tiddler)
		return;
	// retrieve maxLine when we need it
	var maxLine = parseInt(config.options.txtUploadLogMaxLine,10);
	if (isNaN(maxLine))
		maxLine = -1;
	// add text
	if (maxLine != 0) 
		this.tiddler.text = this.tiddler.text + text;
	// Trunck to maxLine
	if (maxLine >= 0) {
		var textArray = this.tiddler.text.split('\n');
		if (textArray.length > maxLine + 1)
			textArray.splice(1,textArray.length-1-maxLine);
			this.tiddler.text = textArray.join('\n');		
	}
	// update tiddler fields
	this.tiddler.modifier = config.options.txtUserName;
	this.tiddler.modified = new Date();
	store.addTiddler(this.tiddler);
	// refresh and notifiy for immediate update
	story.refreshTiddler(this.tiddler.title);
	store.notify(this.tiddler.title, true);
};

bidix.UploadLog.prototype.startUpload = function(storeUrl, toFilename, uploadDir,  backupDir) {
	if (!this.tiddler)
		return;
	var now = new Date();
	var text = "\n| ";
	var filename = bidix.basename(document.location.toString());
	if (!filename) filename = '/';
	text += now.formatString("0DD/0MM/YYYY 0hh:0mm:0ss") +" | ";
	text += config.options.txtUserName + " | ";
	text += "[["+filename+"|"+location + "]] |";
	text += " [[" + bidix.basename(storeUrl) + "|" + storeUrl + "]] | ";
	text += uploadDir + " | ";
	text += "[[" + bidix.basename(toFilename) + " | " +toFilename + "]] | ";
	text += backupDir + " |";
	this.addText(text);
};

bidix.UploadLog.prototype.endUpload = function(status) {
	if (!this.tiddler)
		return;
	this.addText(" "+status+" |");
};

//
// Utilities
// 

bidix.checkPlugin = function(plugin, major, minor, revision) {
	var ext = version.extensions[plugin];
	if (!
		(ext  && 
			((ext.major > major) || 
			((ext.major == major) && (ext.minor > minor))  ||
			((ext.major == major) && (ext.minor == minor) && (ext.revision >= revision))))) {
			// write error in PluginManager
			if (pluginInfo)
				pluginInfo.log.push("Requires " + plugin + " " + major + "." + minor + "." + revision);
			eval(plugin); // generate an error : "Error: ReferenceError: xxxx is not defined"
	}
};

bidix.dirname = function(filePath) {
	if (!filePath) 
		return;
	var lastpos;
	if ((lastpos = filePath.lastIndexOf("/")) != -1) {
		return filePath.substring(0, lastpos);
	} else {
		return filePath.substring(0, filePath.lastIndexOf("\\"));
	}
};

bidix.basename = function(filePath) {
	if (!filePath) 
		return;
	var lastpos;
	if ((lastpos = filePath.lastIndexOf("#")) != -1) 
		filePath = filePath.substring(0, lastpos);
	if ((lastpos = filePath.lastIndexOf("/")) != -1) {
		return filePath.substring(lastpos + 1);
	} else
		return filePath.substring(filePath.lastIndexOf("\\")+1);
};

bidix.initOption = function(name,value) {
	if (!config.options[name])
		config.options[name] = value;
};

//
// Initializations
//

// require PasswordOptionPlugin 1.0.1 or better
bidix.checkPlugin("PasswordOptionPlugin", 1, 0, 1);

// styleSheet
setStylesheet('.txtUploadStoreUrl, .txtUploadBackupDir, .txtUploadDir {width: 22em;}',"uploadPluginStyles");

//optionsDesc
merge(config.optionsDesc,{
	txtUploadStoreUrl: "Url of the UploadService script (default: store.php)",
	txtUploadFilename: "Filename of the uploaded file (default: in index.html)",
	txtUploadDir: "Relative Directory where to store the file (default: . (downloadService directory))",
	txtUploadBackupDir: "Relative Directory where to backup the file. If empty no backup. (default: ''(empty))",
	txtUploadUserName: "Upload Username",
	pasUploadPassword: "Upload Password",
	chkUploadLog: "do Logging in UploadLog (default: true)",
	txtUploadLogMaxLine: "Maximum of lines in UploadLog (default: 10)"
});

// Options Initializations
bidix.initOption('txtUploadStoreUrl','');
bidix.initOption('txtUploadFilename','');
bidix.initOption('txtUploadDir','');
bidix.initOption('txtUploadBackupDir','');
bidix.initOption('txtUploadUserName','');
bidix.initOption('pasUploadPassword','');
bidix.initOption('chkUploadLog',true);
bidix.initOption('txtUploadLogMaxLine','10');


// Backstage
merge(config.tasks,{
	uploadOptions: {text: "upload", tooltip: "Change UploadOptions and Upload", content: '<<uploadOptions>>'}
});
config.backstageTasks.push("uploadOptions");


//}}}

