/***
|''Name''|RenderBufferPlugin|
|''Description''|Transcludes text from a tiddler, specified by line number and number of lines. |
|''Author''|PMario|
|''Version''|0.0.1|
|''Status''|@@experimental@@|
|''Source''|http://codemirror-plugins.tiddlyspace.com/#RenderBuffer.js|
|''License''|[[CC by-nc-sa 3.0|http://creativecommons.org/licenses/by-nc-sa/3.0/]]|
|''CoreVersion''|2.5.0|
|''Keywords''|render wikify buffer tiddler transclusion|
!Documentation
<<<
..
<<<
!!! Usage
<<<
{{{
<<renderBuffer text:'!!! heading
SomeText'>>
}}}
<<renderBuffer text:'!!! heading
SomeText'>>

{{{
<<renderBuffer tiddler:RenderBufferPlugin find:'!Doc' next:'!+ ?Usage'>>
}}}
<<renderBuffer tiddler:RenderBufferPlugin find:'!Doc' next:'!+ ?Usage'>>
<<<
!!! History
<<<
* V 0.0.1 - 2012.02.14
** alpha release
<<<
!!! Code
***/
//{{{

version.extensions.RenderBufferPlugin = {
	major: 0,
	minor: 1,
	revision: 0,
	date: new Date(2012, 2, 14)
};

(function ($) {
	var me;

	config.macros.renderBuffer = me = {
		// should be done for easy localisation
		locale: {
			txtBtnTooltip: "Just for testing at the moment!"
		},
		
		// converts the named params into keys of an object. 
		// Be aware, that parmName:true will be a text "true" variable, not a boolean !!
		// See: https://developer.mozilla.org/en/JavaScript/Guide/Working_with_Objects
		paramsToObject: function (conf, names, params, initValue) {			
			var tmp; 
			for (var i=0, im = names.length; i<im; i += 1) {
				tmp = getParam( params, names[i], initValue);
				
				// the conf.xx variable will only be set if a parameter or "initValue" is defined;
				// For my examples. I don t use initValue!!
				if (tmp) {
					conf[names[i]] = tmp;
				} 
			} // for
		},

		// Set some default values
		defaults: {
			start: 0,
			lines: 5,
			tag: 'span',
			class: 'cmBuffer',
			id: ''
		},

		handler: function (place, macroName, params, wikifier, paramString, tiddler) {
			params = paramString.parseParams(null, null, true);
			// console.log('params', params);
			var btn;				// will be the button element.
			var txtTooltip;			// button tooltip is a helper variable to make the code more readable
			var conf = {};			// contains the named params, to work with.

			// these are optional params which are used by your plugin.
			// no 'place' param is allowed, it will be overwritten.
			var names = ['text', 'tiddler', 'start', 'lines', 'find', 'next', 'id', 'button'];

			// define the default values, if needed. See: http://api.jquery.com/jQuery.extend/
			$.extend(conf, me.defaults);
	
			// next function converts names into object keys.
			// can be: me.paramsToObject(conf, names, params, initValue); 
			// BUT initValue will overwrite me.defaults! code line above
			me.paramsToObject(conf, names, params);

			conf.place = place;        // place will be needed to find the containing element.
			
			// ============================================================================
			// from here on, you can work with your "conf" object, that contains the params.
	 		// console.log('conf: ', conf);

			// start default line = 1 ==> index 0
			conf.start = (conf.start > 0) ? parseInt(conf.start,10)-1 : 0; 
			conf.lines = parseInt(conf.lines,10);
			conf.tiddler = (conf.tiddler) ? conf.tiddler : null;
			
			conf.output = createTiddlyElement(place, conf.tag, conf.id, conf.class);

			$(conf.output).data('conf', conf).attr({"refresh":'macro', "macroname": macroName});

			if (conf.button) {
				txtTooltip = (conf.tooltip) ? conf.tooltip : me.locale.txtBtnTooltip;

				// next comment line is used as a reminder for the possible/needed parameters
				// createTiddlyButton(parent, text, tooltip, action, className, id, accessKey, attribs)			
				btn = createTiddlyButton(place, conf.button, txtTooltip, me.onClick, 'button');

				// adding a jQuery data object to the button. see: http://api.jquery.com/jQuery.data/
				var result = $(btn).data('data', conf.output);

				// var result is just there, to be used as a console.log var in the next line.
				// console.log('result:', result);
			} // if

			if (!conf.button) me.refresh(conf.output);
		}, // handler

		refresh: function (el) {
			var tmp
				, iMax
				, regStart, regNext
				, conf = $(el).data('conf');
						
			// if tiddler is specified, text will not be used
			conf.text = (conf.tiddler) ? store.getTiddlerText(conf.tiddler) : conf.text;

			tmp = conf.text.split('\n');
			iMax = (tmp.length >= conf.lines) ? conf.lines : tmp.length;
// console.log('tmp: ', tmp, conf.text);
			if (conf.find) {
				// TODO may be remove special handling and move this to documentation
				// <<renderBuffer find:"!(?=[^!])" should do it as well. Is difficult for users :(
				if (conf.find      === '!')      regStart = new RegExp('^!(?=[^!])', 'im')
				else if (conf.find === '!!')     regStart = new RegExp('^!!(?=[^!])', 'im')
				else if (conf.find === '!!!')    regStart = new RegExp('^!!!(?=[^!])', 'im')
				else if (conf.find === '!!!!')   regStart = new RegExp('^!!!!(?=[^!])', 'im')
				else if (conf.find === '!!!!!')  regStart = new RegExp('^!!!!!(?=[^!])', 'im')
				else if (conf.find === '!!!!!!') regStart = new RegExp('^!!!!!!', 'im')
				else regStart = new RegExp('^' + conf.find, 'im'); 

				if (conf.next      === '!')      regNext = new RegExp('^!(?=[^!])', 'im')
				else if (conf.next === '!!')     regNext = new RegExp('^!!(?=[^!])', 'im')
				else if (conf.next === '!!!')    regNext = new RegExp('^!!!(?=[^!])', 'im')
				else if (conf.next === '!!!!')   regNext = new RegExp('^!!!!(?=[^!])', 'im')
				else if (conf.next === '!!!!!')  regNext = new RegExp('^!!!!!(?=[^!])', 'im')
				else if (conf.next === '!!!!!!') regNext = new RegExp('^!!!!!!', 'im')
				else regNext  = new RegExp('^' + conf.next, 'im');

				iMax = tmp.length;
				for (i=0, iMax=tmp.length; i < iMax; i++ ) {
					match = tmp[i].match(regStart);
					if (match != null) {
						conf.start = i;
						// set iMax to conf.lines. It will be recalculated if conf.next exists
						iMax = conf.lines;// iMax - i;
						i += 1;
						break;
					}
				} // for

				if (conf.next) {
					for (iMax=tmp.length; i < iMax; i++ ) {
						match = tmp[i].match(regNext);
						if (match != null) {
							iMax = i-conf.start;
							break;
						}
					}
				} // if 
			} // if (conf.find)

			conf.text = tmp.slice(conf.start, conf.start+iMax).join('\n');

			$(conf.output).empty();
			wikify(conf.text, conf.output);
		},

		onClick: function() {
			// since the handlers context is not defined in the right way, when the button is clicked
			// it needs to be loaded from the jQuery data object. http://api.jquery.com/jQuery.data/
			var data = $(this).data("data");
			me.refresh(data);
 		}			
	}; // end plugin
})(jQuery);

//}}}


