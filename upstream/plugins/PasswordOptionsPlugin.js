/***
|''Name:''|PasswordOptionPlugin|
|''Description:''|Extends TiddlyWiki options with non encrypted password option.|
|''Version:''|1.0.2|
|''Date:''|Apr 19, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#PasswordOptionPlugin|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (Beta 5)|
***/
//{{{
version.extensions.PasswordOptionPlugin = {
	major: 1, minor: 0, revision: 2, 
	date: new Date("Apr 19, 2007"),
	source: 'http://tiddlywiki.bidix.info/#PasswordOptionPlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	license: '[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D]]',
	coreVersion: '2.2.0 (Beta 5)'
};

config.macros.option.passwordCheckboxLabel = "Save this password on this computer";
config.macros.option.passwordInputType = "password"; // password | text
setStylesheet(".pasOptionInput {width: 11em;}\n","passwordInputTypeStyle");

merge(config.macros.option.types, {
	'pas': {
		elementType: "input",
		valueField: "value",
		eventName: "onkeyup",
		className: "pasOptionInput",
		typeValue: config.macros.option.passwordInputType,
		create: function(place,type,opt,className,desc) {
			// password field
			config.macros.option.genericCreate(place,'pas',opt,className,desc);
			// checkbox linked with this password "save this password on this computer"
			config.macros.option.genericCreate(place,'chk','chk'+opt,className,desc);			
			// text savePasswordCheckboxLabel
			place.appendChild(document.createTextNode(config.macros.option.passwordCheckboxLabel));
		},
		onChange: config.macros.option.genericOnChange
	}
});

merge(config.optionHandlers['chk'], {
	get: function(name) {
		// is there an option linked with this chk ?
		var opt = name.substr(3);
		if (config.options[opt]) 
			saveOptionCookie(opt);
		return config.options[name] ? "true" : "false";
	}
});

merge(config.optionHandlers, {
	'pas': {
 		get: function(name) {
			if (config.options["chk"+name]) {
				return encodeCookie(config.options[name].toString());
			} else {
				return "";
			}
		},
		set: function(name,value) {config.options[name] = decodeCookie(value);}
	}
});

// need to reload options to load passwordOptions
loadOptionsCookie();

/*
if (!config.options['pasPassword'])
	config.options['pasPassword'] = '';

merge(config.optionsDesc,{
		pasPassword: "Test password"
	});
*/
//}}}