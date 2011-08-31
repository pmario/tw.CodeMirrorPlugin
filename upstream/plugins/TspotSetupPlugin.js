/***
Description: Contains the stuff you need to use Tiddlyspot
Note, you also need UploadPlugin, PasswordOptionPlugin and LoadRemoteFileThroughProxy
from http://tiddlywiki.bidix.info for a complete working Tiddlyspot site.
***/
//{{{

// edit this if you are migrating sites or retrofitting an existing TW
config.tiddlyspotSiteId = 'yourTiddlySpotNameHere';

// make it so you can by default see edit controls via http
config.options.chkHttpReadOnly = false;
window.readOnly = false; // make sure of it (for tw 2.2)
window.showBackstage = true; // show backstage too

// disable autosave in d3
if (window.location.protocol != "file:")
	config.options.chkGTDLazyAutoSave = false;

// tweak shadow tiddlers to add upload button, password entry box etc
with (config.shadowTiddlers) {
	SiteUrl = 'http://'+config.tiddlyspotSiteId+'.tiddlyspot.com';
	SideBarOptions = SideBarOptions.replace(/(<<saveChanges>>)/,"$1<<tiddler TspotSidebar>>");
	OptionsPanel = OptionsPanel.replace(/^/,"<<tiddler TspotOptions>>");
	DefaultTiddlers = DefaultTiddlers.replace(/^/,"[[WelcomeToTiddlyspot]] ");
	MainMenu = MainMenu.replace(/^/,"[[WelcomeToTiddlyspot]] ");
}

// create some shadow tiddler content
merge(config.shadowTiddlers,{

'TspotOptions':[
 "tiddlyspot password:",
 "<<option pasUploadPassword>>",
 ""
].join("\n"),

'TspotControls':[
 "| tiddlyspot password:|<<option pasUploadPassword>>|",
 "| site management:|<<upload http://" + config.tiddlyspotSiteId + ".tiddlyspot.com/store.cgi index.html . .  " + config.tiddlyspotSiteId + ">>//(requires tiddlyspot password)//<br>[[control panel|http://" + config.tiddlyspotSiteId + ".tiddlyspot.com/controlpanel]], [[download (go offline)|http://" + config.tiddlyspotSiteId + ".tiddlyspot.com/download]]|",
 "| links:|[[tiddlyspot.com|http://tiddlyspot.com/]], [[FAQs|http://faq.tiddlyspot.com/]], [[blog|http://tiddlyspot.blogspot.com/]], email [[support|mailto:support@tiddlyspot.com]] & [[feedback|mailto:feedback@tiddlyspot.com]], [[donate|http://tiddlyspot.com/?page=donate]]|"
].join("\n"),

'WelcomeToTiddlyspot':[
 "This document is a ~TiddlyWiki from tiddlyspot.com.  A ~TiddlyWiki is an electronic notebook that is great for managing todo lists, personal information, and all sorts of things.",
 "",
 "@@font-weight:bold;font-size:1.3em;color:#444; //What now?// &nbsp;&nbsp;@@ Before you can save any changes, you need to enter your password in the form below.  Then configure privacy and other site settings at your [[control panel|http://" + config.tiddlyspotSiteId + ".tiddlyspot.com/controlpanel]] (your control panel username is //" + config.tiddlyspotSiteId + "//).",
 "<<tiddler TspotControls>>",
 "See also GettingStarted.",
 "",
 "@@font-weight:bold;font-size:1.3em;color:#444; //Working online// &nbsp;&nbsp;@@ You can edit this ~TiddlyWiki right now, and save your changes using the \"save to web\" button in the column on the right.",
 "",
 "@@font-weight:bold;font-size:1.3em;color:#444; //Working offline// &nbsp;&nbsp;@@ A fully functioning copy of this ~TiddlyWiki can be saved onto your hard drive or USB stick.  You can make changes and save them locally without being connected to the Internet.  When you're ready to sync up again, just click \"upload\" and your ~TiddlyWiki will be saved back to tiddlyspot.com.",
 "",
 "@@font-weight:bold;font-size:1.3em;color:#444; //Help!// &nbsp;&nbsp;@@ Find out more about ~TiddlyWiki at [[TiddlyWiki.com|http://tiddlywiki.com]].  Also visit [[TiddlyWiki.org|http://tiddlywiki.org]] for documentation on learning and using ~TiddlyWiki. New users are especially welcome on the [[TiddlyWiki mailing list|http://groups.google.com/group/TiddlyWiki]], which is an excellent place to ask questions and get help.  If you have a tiddlyspot related problem email [[tiddlyspot support|mailto:support@tiddlyspot.com]].",
 "",
 "@@font-weight:bold;font-size:1.3em;color:#444; //Enjoy :)// &nbsp;&nbsp;@@ We hope you like using your tiddlyspot.com site.  Please email [[feedback@tiddlyspot.com|mailto:feedback@tiddlyspot.com]] with any comments or suggestions."
].join("\n"),

'TspotSidebar':[
 "<<upload http://" + config.tiddlyspotSiteId + ".tiddlyspot.com/store.cgi index.html . .  " + config.tiddlyspotSiteId + ">><html><a href='http://" + config.tiddlyspotSiteId + ".tiddlyspot.com/download' class='button'>download</a></html>"
].join("\n")

});
//}}}
