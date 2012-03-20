
(function(){
	//TODO : create an object with new in order to be able to have "locals" changes for the dialog box,
	//local changes that are merged when modifications validates.
	lh.history = {};
	
	//TODO : take in account the graph related to this changes
	// with a changeObject like {graphNameA : [], graphName2 : []} ??
	lh.history.changes = {};
	lh.history.changes.values = [];
	
	///RDF management
	lh.history.ns = {
		    namespaces: { 
		    	h: 'http://www.culture-terminology.org/ontoHisto/',
		    	skos: 'http://www.w3.org/2004/02/skos/core#'
		    	//,rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"
		    }
	  };
	
	//root node of the current history, need to be initialized with the databank
	lh.history.hRootNode = {};	

	lh.history.rdfChanges = {};
	
	__ElementNode = function(s,v){
		//if(Object.prototype.toString.call( v ) === '[object Array]'){
		if(v[0]){
			lh.history.rdfChanges.add($.rdf.triple(s,"h:element",v[0],lh.history.ns));
			if(v[1]){
				lh.history.rdfChanges.add($.rdf.triple(s,"h:newValue",v[1],lh.history.ns));
			}
			//v[1] is null so it's the delete action that is call
			else{
				lh.history.rdfChanges.add($.rdf.triple(s,"h:newValue","h:delete",lh.history.ns));
			}
		}
		else{
			lh.history.rdfChanges.add($.rdf.triple(s,"h:element",v,lh.history.ns));
		}
	}
	
	//here s,p and o are already resource or literal
	//if s,p or o is an array this mean new value or deleted.
	// structure is [oldValue,newValue] : for a new value
	// [oldValue, null] : for delete a value
	lh.history.newTriple= function(s,p,o){
		
		var changeNode = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeSubject = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeProperty = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeObject = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		
		//add the change node to the history triple
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"h:change",changeNode,lh.history.ns));
		
		//change triples initialisation
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"a","h:change",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:from","<http://define.GRAPH.VERSION>",lh.history.ns));
		//TODO : deal with proper date format
		var dt = $.rdf.literal(Date.now());
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:date",dt,lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:user",'"default user"',lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:subject",changeSubject,lh.history.ns));
		
		//subject triples
		lh.history.rdfChanges.add($.rdf.triple(changeSubject,"a","h:subject",lh.history.ns));
		//lh.history.rdfChanges.add($.rdf.triple(changeSubject,"h:element",s,lh.history.ns));
		__ElementNode(changeSubject,s);
		lh.history.rdfChanges.add($.rdf.triple(changeSubject,"h:property",changeProperty,lh.history.ns));
		
		//property triples
		lh.history.rdfChanges.add($.rdf.triple(changeProperty,"a","h:property",lh.history.ns));
		//lh.history.rdfChanges.add($.rdf.triple(changeProperty,"h:element",p,lh.history.ns));
		__ElementNode(changeProperty,p);
		lh.history.rdfChanges.add($.rdf.triple(changeProperty,"h:object",changeObject,lh.history.ns));
		
		//object triples
		lh.history.rdfChanges.add($.rdf.triple(changeObject,"a","h:object",lh.history.ns));
		//lh.history.rdfChanges.add($.rdf.triple(changeObject,"h:element",o,lh.history.ns));
		__ElementNode(changeObject,o);
	};
	
	lh.history.crudop = function(op, objectNode,p,o,l){
		
		//****** TODO : remove this and remplace by lh.history.newTriple();
		var changeNode = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeSubject = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeProperty = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeObject = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		
		var nodeSubject = $.rdf.resource("<"+objectNode["@subject"]+">",lh.history.ns);
		//var nodeProperty = $.rdf.resource("<"+p+">");
		var nodeProperty = $.rdf.resource("skos:"+p,lh.history.ns);
		var oldval = lh.sem.getPropValue(p,objectNode,l);
		var nodeObjectOldVal = null;
		if(oldval != null){
			var nodeObjectOldVal = $.rdf.literal(oldval,{lang:l});
		}
		//delete the object if new val = "";
		var nodeObjectNewVal = $.rdf.literal(o,{lang:l});
		if (o == ""){
			nodeObjectNewVal = $.rdf.resource("h:delete",lh.history.ns);
		}
		
		
		//add the change node to the history triple
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"h:change",changeNode,lh.history.ns));
		
		
		//change triples initialisation
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"a","h:change",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:from","<http://define.GRAPH.VERSION>",lh.history.ns));
		//TODO : deal with proper date format
		var dt = $.rdf.literal(Date.now());
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:date",dt,lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:user",'"default user"',lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeNode,"h:subject",changeSubject,lh.history.ns));
		
		//subject triples
		lh.history.rdfChanges.add($.rdf.triple(changeSubject,"a","h:subject",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeSubject,"h:element",nodeSubject,lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeSubject,"h:property",changeProperty,lh.history.ns));
		
		//property triples
		lh.history.rdfChanges.add($.rdf.triple(changeProperty,"a","h:property",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeProperty,"h:element",nodeProperty,lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(changeProperty,"h:object",changeObject,lh.history.ns));
		
		//object triples
		lh.history.rdfChanges.add($.rdf.triple(changeObject,"a","h:object",lh.history.ns));
		if(nodeObjectOldVal != null){
			lh.history.rdfChanges.add($.rdf.triple(changeObject,"h:element",nodeObjectOldVal,lh.history.ns));
			lh.history.rdfChanges.add($.rdf.triple(changeObject,"h:newValue",nodeObjectNewVal,lh.history.ns));
		}
		else{
			lh.history.rdfChanges.add($.rdf.triple(changeObject,"h:element",nodeObjectNewVal,lh.history.ns));
		}
		
		//****** END TODO : remove this and remplace by lh.history.createChange();
		
		/****** old style generation and property change (see setpropvalue ***/
		/** TODO : remove generation but keep value changing **/
		c = {};
		c.crud = op;
		c.subject = objectNode["@subject"];
		c.predicate = p;
		
		//change the value of the object
		modif = lh.sem.setPropValue(objectNode,p,o,l);
		
		c.object = modif;
		c.date = Date.now();
		c.user ="defaultUser";
		lh.history.changes.values.push(c);
		
	};
	
	lh.history.update = function(objectNode,p,o,l){
		lh.history.crudop("u",objectNode,p,o,l);
	};
	
	lh.history.create = function(objectNode,p,o,l){
		lh.history.crudop("c",objectNode,p,o,l);
	};
	
	//TODO : add a date parameter for revert before a date
	lh.history.revertChanges = function(){
		lh.history.changes.values.reverse().forEach(function(c){
			//TODO : get setpropValue get directly the c.object[0] ==> create a js litteral(factory)
			lh.sem.setPropValue(node,c.predicate,c.object[0]["@literal"],c.object[0]["@language"]);
			test = "";
		});
	};
	
	
	lh.history.createLocalChange = function(graph){
		lh.history.ns.base = graph.history.hroot.toString();
		lh.history.hRootNode = $.rdf.resource("<"+graph.history.hroot+">");
		
		lh.history.rdfChanges = $.rdf.databank([],lh.history.ns);
		
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"a","h:history",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"h:historyOf","<"+graph.graphURI+">",lh.history.ns));
		
	};
	
})();

(function(){
	
	
	//check if value have changed
	function isValueChanged(o,p,d,l){
		
		if(o == lh.sem.getPropValue(p,d,l)) return false;
		if ((o=="") && (lh.sem.getPropValue(p,d,l) == null)) return false;
		
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
	
	
	
	lh.modify.buildDialog = function(d){
		node = d;
		
		//**** TODO : use lh.history.createLocalChange
		//define the base for this localhistory
		lh.history.ns.base = d.ingraph.history.hroot.toString();
		lh.history.hRootNode = $.rdf.resource("<"+d.ingraph.history.hroot+">");
		
		lh.history.rdfChanges = $.rdf.databank([],lh.history.ns);
		
		//lh.history.hRootNode = $.rdf.resource("<http://historyFILE.com/DO-GENERATE>");
		//lh.history.hRootNode = "<"+d.ingraph.history.hroot+">";
		//alert(lh.history.hRootNode);
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"a","h:history",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"h:historyOf","<"+d.ingraph.graphURI+">",lh.history.ns));
		
		/*alert("test if != databank");
		var serializer = new XMLSerializer();
		var localdump = lh.history.rdfChanges.dump({format:'application/rdf+xml'});
		var graphdump = d.ingraph.history.rdfChanges.dump({format:'application/rdf+xml'});
		alert(serializer.serializeToString(localdump));
		alert(serializer.serializeToString(graphdump));
		alert("end test");*/
		
		//**** TODO : end use lh.history.createLocalChange
		
		//d.updatedTriples = {};
		function createField(val){
			res = $("<textarea rows='1' />");
			//attributes to identify the field
			$(res).attr("predicate",val);
			$(res).attr("language",d.ingraph.curLang);
			data = lh.sem.getPropValue(val, d);
			data ? $(res).val(data) : $(res).attr("placeholder","Value not set for this language");
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
				o = $(this).val(); 
				p = $(this).attr("predicate");
				l = $(this).attr("language");
				
				if(isValueChanged(o,p,d,l)){
					lh.history.update(d,p,o,l);
				} 
			});
			
			return res;
		}
		
		lh.utils.langSelector( $("#modifyLang"), d.ingraph.langArray,
				function(){
					var lang = this.options[this.selectedIndex].value; 
					$( "#dialog-form textarea" ).each(function(n){
						$(this).attr("language",lang);
						val = lh.sem.getPropValue($(this).attr("predicate"),d, lang);
						
						val ? $(this).val(val) : $(this).val("");
					});
		});
		
		var a = skosOnto.getValues();
		
		var tab_content;
		var tabTemplateSimple = "<li><a href='#{href}'>#{label}</a>";
		var tabTemplateWithClose = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>";
		var $tabs = $("#tabs").tabs({
			tabTemplate: tabTemplateWithClose,
			add: function( event, ui ) {
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
		a.forEach(function(val){ 
			if(d[val]){
				//ulTabs = $(ulTabs).append('<li><a href="#tabs-'+val+'">'+val+'</a></li>');
				//divs = $(divs).append($('<div id="tabs-'+val+'"> </div>').append(createField(val)));
				tab_content = createField(val);
				$tabs.tabs( "add", '#tabs-'+val,val );
			} 
		});
		
		function addPropertyTab(jqtabs,propName){
			
			tab_content = createField(propName);
			$tabs.tabs("add","#tabs-"+propName,propName,($tabs.tabs("length") - 1));
			//open the just created tab
			$tabs.tabs("select",($tabs.tabs("length") - 2));
			var langSel = $("#modifyLang")[0];
			var l = langSel.options[langSel.selectedIndex].value;
			lh.history.create(node,propName,null,l);
		}
		
		function getActiveLinks(){
			var res = $("<ul></ul>");
			a.forEach(function(val,i){
				//keep only properties that are not actually presents
				if (!d[val]){
					res.append($('<li></li>').append($('<a href="#'+val+'">'+val+'</a>').click(function(){addPropertyTab($tabs,val);})));
				}
			});
			return res;
		}
		
		//add the + tab
		//put a simple tab template (this tab is not closable
		$tabs.tabs( "option", "tabTemplate", tabTemplateSimple );
		//var active_link = $('<a href="#">add prop</a>').click(function(){addPropertyTab($tabs);});
		//tab_content = $('<p></p>').append(active_link);
		tab_content = $('<p></p>').append(getActiveLinks());
		$tabs.tabs( "add", '#tabs-add','+' );
		//reset the tab template with closable
		$tabs.tabs( "option", "tabTemplate", tabTemplateWithClose);
		
		
	};
	
	lh.modify.save = function(){
		var dump = lh.history.rdfChanges.dump({format:'application/rdf+xml'});
		var serializer = new XMLSerializer();
		var xmldump = serializer.serializeToString(dump); 
		//send change history to the server
		$.ajax({
			url : lh.server+"skosifier/changes",
			type : "POST",
			data : {change : xmldump},
		}).done(function( msg ) {
			//TODO : a fadin fadout message for says ok
			  //alert( "Data Saved: " + msg );
		});
			
		
		
		//alert("after");
		//alert(JSON.stringify(lh.history.changes));
		return d;
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
