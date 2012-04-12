//TODO : try to override the jquery with add a s,p,o properties to objects
(function(){
	semUI = (function(){
		semUI.fn = semUI.prototype = {
				constructor: semUI,
				init: function( selector, context, rootjQuery ){
					return $(selector,context,rootjQuery);
				}
		};
	});
	
})();


(function(){
	
	
	//check if value have changed
	/*function isValueChanged(o,p,d,l){
		if(o == lh.sem.getPropValue(p,d,l)) return false;
		if ((o=="") && (lh.sem.getPropValue(p,d,l) == null)) return false;
		return true;
	}*/
	function isValueChanged(o,oldo){
		if(o == oldo) return false;
		if ((o=="") && (oldo == null)) return false;
		return true;
	}
	
	lh.modify = {};
	//var changes;
	var node;
	
	lh.modify.initModifyUI = function(selector){
		//jqueryui dialog box
		$( selector ).dialog({
			autoOpen: false,
			/*height: 300,
			width: 350,*/
			autoResize:true,
			modal: true,
			buttons: {
				"Save changes": function() {
					n = lh.modify.save();
					lh.graph.update(n.ingraph,n);
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					n = lh.modify.cancel();
					lh.graph.update(n.ingraph,n);
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				
			}
		});
	};
	
	$.fn.sem = function () {
	    var self = this;
	    self.subject = {};
	    self.predicate = {};
	    self.object = {};
	    self.triple = {};
	    
	    if (!this.data("sem")) {
	        this.data("sem", {
	           element: self,
	           s : function(v){
					if(!v){
						return self.subject;
					}
					else{
						self.subject = v;
						self.attr("about",v);
					}
	           },
	           p : function(v){
					if(!v){
						return self.predicate;
					}
					else{
						self.predicate = v;
						self.attr("predicate",v);
					}
				},
				o : function(o){
					if(!o){
						return self.object;
					}
					else{
						self.object = o;
						self.attr("language",o.lang);
						o ? self.val(o.value) : self.attr("placeholder","Value not set for this language");
					}
				},
				triple : function(trp){
					if(!trp){
						return self.triple;
					}
					else{
						self.triple = trp;
					}
				}
	        });
	    }

	    return this.data("sem");
	};

	
	lh.modify.buildDialog = function(d){
		
		function createField(p,o){
			var res = $("<textarea rows='1' />");
			
			var s = res.sem();
			//set the subject as it's used for create the history file
			s.s(d.uri);
			s.p(p);
			s.o(o);
			s.triple($.rdf.triple(d.uri,p,o,lh.history.ns));
			
			//o ? $(res).val(o.value) : $(res).attr("placeholder","Value not set for this language");
			$(res).val(o.value);
			$(res).attr("placeholder","Value not set for this language");
			
			/* workaround for https://github.com/padolsey/jQuery.fn.autoResize/issues/35
			 * see tabs for 1st part of workaround
			 */
			$(res).focus(function(d,i){
					$(this).autoResize({
						extraSpace : 5,
						minHeight : "original",
					});
				});
			
			$(res).focusout(function(){
				var o = $(this).val(); 
				var p = $(this).attr("predicate");
				var l = $(this).attr("language");
				var sem = $(this).sem();
				/*var s = sem.s();
				var p = sem.p();
				var o = sem.o();*/
				//if(isValueChanged(o,p,d,l)){
				if(isValueChanged(o,sem.o().value)){
					//lh.history.update(d,p,o,l);
					lh.history.update(sem.triple(),p,o,l);
				} ;
			});
			return res;
		};
		
		
		
		
		//create field and init container if $container null
		//update $container if not null
		function createFields(p,o,lang,$container){
			if(!$container){
				$container = $("<div> </div>");
				//class for identify the sem container
				$container.attr("class","semContainer");
			}
			var s = $container.sem();
			s.p(p);
			s.o(o);
			
			var fo = o;
			if(lang){
				fo = o.filter(function(d,i){
					return d.lang == lang || d.type == "uri";
				});
				
			}
			//s.o(po.o);
			//TODO : use the field separator in container append
			var fieldSeparator = "<p> </p>";
			//if($.isArray(o)){
				fo.forEach(function(vo,i){
					$container = $container.append($("<p> </p>").append(createField(p,vo)));
				});
				//create an empty field when the property don't exist in the language
				if(fo.length == 0){
					//TODO : deal with case where it's not a literal that come in
					//use the more generic constructor (with the type:"" property)
					var onull = $.rdf.literal("",{lang : lang});
					$container = $container.append($("<p> </p>").append(createField(p,onull)));
				}
			/*}else{
				$container = $container.append($("<p> </p>").append(createField(p,o)));
			}*/
			return $container;
		}
		
		function addPropertyTab(jqtabs,propName){
			//get current language
			var langSel = $("#modifyLang")[0];
			var l = langSel.options[langSel.selectedIndex].value;
			
			//tab_content = createField(propName);
			var emptyLit = $.rdf.literal("" , {lang : l});
			tab_content = createField(propName,emptyLit);
			$tabs.tabs("add","#tabs-"+propName.value.fragment,propName.value.fragment,($tabs.tabs("length") - 1));
			//open the just created tab
			$tabs.tabs("select",($tabs.tabs("length") - 2));
			
			alert("TODO : create an history here ? maybe not, just when a value is filled");
			lh.history.create(node,propName,null,l);
		};
		
		function getActiveLinks(){
			var res = $("<ul></ul>");
			//TODO : optimise this, use a clean export for skos properties
			//TODO : for genericity, pass the full uri for "val"
			a.forEach(function(val,i){
				var hasprop = propObjList.filter(function(i,po){
					return po.p.value.fragment == val;
				});
				//keep only properties that are not actually presents
				if (hasprop.length == 0){
					//res.append($('<li></li>').append($('<a href="#'+val+'">'+val+'</a>').click(function(){addPropertyTab($tabs,val);})));
					var p = $.rdf.resource("skos:"+val,lh.history.ns);
					res.append($('<li></li>').append($('<a href="#'+val+'">'+val+'</a>').click(function(){addPropertyTab($tabs,p);})));
				}
			});
			return res;
		};
		
		var node = d;
		
		lh.history.initLocalChange(d.ingraph);
		
		lh.utils.langSelector( $("#modifyLang"), d.ingraph.langArray,
				function(){
					var lang = this.options[this.selectedIndex].value;
					//select all .semContainer that are not tabs-add 
					//TODO : check if (id!='tabs-add']) is necessary, ie there is a .semContainer on ?
					$("#dialog-form  *[id^='tabs-'][id!='tabs-add'] .semContainer").each(function(t){
						var emptyLit = $.rdf.literal("" , {lang : lang});
						$(this).empty();
						tab_content = createFields($(this).sem().p(),$(this).sem().o(),lang,$(this));
					});
		});
		
		
		
		var tab_content;
		var tabTemplateSimple = "<li><a href='#{href}'>#{label}</a>";
		var tabTemplateWithClose = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>";
		var $tabs = $("#tabs").tabs({
			tabTemplate: tabTemplateWithClose,
			add: function( event, ui ) {
				//var testADD = $( ui.panel ).add("<div></div>");
				$( ui.panel ).append(tab_content);
				$(ui.tab.nextElementSibling).click(function(){
					var index = $( "li", $tabs ).index( $( this ).parent() );
					$tabs.tabs( "remove", index );
					return false;
				});
			},
			selected : 0,
			/* workaround for https://github.com/padolsey/jQuery.fn.autoResize/issues/35
			 * see the focus event for 2nd workaround part 
			 */
			show: function(event, ui) {
				$(ui.panel).children("textarea").trigger("focus");
			}
		});
		
		//clean all tabs
		var l = $tabs.tabs( "length" );
		for (var i = 0 ; i < l ; i++){
			$tabs.tabs( "remove" , 0 ); // remove the 0 index as the index size change at each remove
		}
		
		txt = "";
		var a = skosOnto.getValues();
		var lang = d.ingraph.curLang;
		var propObjList = $.rdf({databank : d.ingraph.rdf.databank})
						.prefix("skos","http://www.w3.org/2004/02/skos/core#")
						.where(d.uri+" ?p ?o")
						/*.filter(function(){
                                       if(lang){
                                               return this.o.lang == lang;
                                       }
                                       //if lang is null don't filter
                                       else return true;
                         })*/
						.group('p');
		
		function tabRenderer(lang){
			tab_content = createFields(this.p,this.o,lang);
			$tabs.tabs( "add", '#tabs-'+this.plainName,this.plainName );
		};
		
		//TODO : make the propertieBoxes an object and create the .render(lang) func
		d.propertiesBoxes = [];
		propObjList.each(function(i,po){
			//TODO : here we limit to literal, see UI for remove this limitation (link ?)
			//also, use the type/link filter to only get literal
			if(po.p != "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>"){
				
				var propBox = {};
				propBox.p = po.p;
				//!$.isArray(po.o) ? propBox.o = [po.o] : propBox.o = po.o ;
				propBox.o = toArray(po.o);
				propBox.plainName = po.p.value.fragment;
				propBox.template = tabRenderer;
				d.propertiesBoxes.push(propBox);
//				tab_content = createFields(po);
//				$tabs.tabs( "add", '#tabs-'+po.p.value.fragment,po.p.value.fragment );
			}
		});
		
		d.propertiesBoxes.forEach(function(pb,i){
			//TODO call this function render, into each propBox but also on the global object propertieBox
			pb.template.call(pb,lang);
		});
		//a.forEach(function(val){ 
			//if(d[val]){
				//ulTabs = $(ulTabs).append('<li><a href="#tabs-'+val+'">'+val+'</a></li>');
				//divs = $(divs).append($('<div id="tabs-'+val+'"> </div>').append(createField(val)));
//				tab_content = createField(val);
//				$tabs.tabs( "add", '#tabs-'+val,val );
			//} 
//		});
		
		
		
		//add the + tab
		//put a simple tab template (this tab is not closable
		$tabs.tabs( "option", "tabTemplate", tabTemplateSimple );
		//var active_link = $('<a href="#">add prop</a>').click(function(){addPropertyTab($tabs);});
		//tab_content = $('<p></p>').append(active_link);
		tab_content = $('<p></p>').append(getActiveLinks());
		$tabs.tabs( "add", '#tabs-add','+' );
		//reset the tab template with closable
		$tabs.tabs( "option", "tabTemplate", tabTemplateWithClose);
		
		
		lh.modify.save = function(){
			var dump = lh.history.rdfChanges.dump({format:'application/rdf+xml'});
			var serializer = new XMLSerializer();
			var xmldump = serializer.serializeToString(dump); 
			//send change history to the server
			/*$.ajax({
				url : lh.server+"skosifier/changes",
				type : "POST",
				data : {change : xmldump},
			}).done(function( msg ) {
				//TODO : a fadin fadout message for says ok
				  //alert( "Data Saved: " + msg );
			});
			*/
			lh.history.apply(lh.history.rdfChanges,d.ingraph.rdf.databank);
			return d;
		};
		
	//end of lh.modify.buildDialog	
	};
	
	
		
	/*lh.modify.revertChanges = function(){
		lh.history.changes.values.reverse().forEach(function(c){
			//TODO : get setpropValue get directly the c.object[0] ==> create a js litteral(factory)
			lh.sem.setPropValue(node,c.predicate,c.object[0]["@literal"],c.object[0]["@language"]);
			test = "";
		});
	};*/
	
	lh.modify.cancel = function(){
		//lh.modify.revertChanges();
		lh.history.revertChanges();
		return node;
	}
	
})();
