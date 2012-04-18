(function(){
	
	//-- arrays utilities
	
	toArray = function(v){
		return [].slice.call(v);
	};
	
	//TODO : create a lib for array management
	//look at array imps here and see if include in the lib : https://github.com/mbostock/d3/wiki/Arrays#wiki-d3_nest	

	//add the last() utility to array
	if(!Array.prototype.last) {
	    Array.prototype.last = function() {
	        return this[this.length - 1];
	    };
	}
	
	//lazy indexOf allow you to define your own comparator.
	//this comparator must compare two variables and return true/false
	//the first variable is the array caller param, the second is the variable pass to indexOf
	if (!Array.prototype.lazyIndexOf) {  
	    Array.prototype.lazyIndexOf = function (f,searchElement /*, fromIndex */ ) {  
	        "use strict";  
	        if (this == null) {  
	            throw new TypeError();  
	        }  
	        var t = Object(this);  
	        var len = t.length >>> 0;  
	        if (len === 0) {  
	            return -1;  
	        }  
	        var n = 0;  
	        if (arguments.length > 0) {  
	            n = Number(arguments[2]);
	            if (n != n) { // shortcut for verifying if it's NaN  
	                n = 0;  
	            } else if (n != 0 && n != Infinity && n != -Infinity) {  
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));  
	            }  
	        }  
	        if (n >= len) {  
	            return -1;  
	        }  
	        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);  
	        for (; k < len; k++) {
	            //if (k in t && t[k] === searchElement) {
	        	if (k in t && f.call(this,t[k],searchElement)) {
	                return k;  
	            }  
	        }  
	        return -1;  
	    };
	} 
	
	//put many arrays in one, with unique element (remove duplicates)
	//from : http://stackoverflow.com/a/7122370
	Array.prototype.merge = function(/* variable number of arrays */){
	    for(var i = 0; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < array.length; j++){
	            if(this.indexOf(array[j]) === -1) {
	                this.push(array[j]);
	            }
	        }
	    }
	    return this;
	};
	
	//lazy merge, merge array with lazy comparator
	Array.prototype.lazyMerge = function(f /* variable number of arrays */){
	    for(var i = 1; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < array.length; j++){
	            if(this.lazyIndexOf(f,array[j]) === -1) {
	                this.push(array[j]);
	            }
	        }
	    }
	    return this;
	};
	
	//lazyunion : only keep elements in the original array that is in *all* params arrays
	Array.prototype.lazyUnion = function(f /* variable number of arrays */){
	    for(var i = 1; i < arguments.length; i++){
	        var array = arguments[i];
	        for(var j = 0; j < this.length; j++){
	            if(array.lazyIndexOf(f,this[j]) === -1) {
	                //this.push(array[j]);
	                this.splice(j,j);
	            }
	        }
	    }
	    return this;
	};
	
	//TODO : test if multiple array is well passing throw
	Array.prototype.lazyUnionAndMerge = function(f /* variable number of arrays */){
		this.lazyUnion.apply(this, arguments);
		this.lazyMerge.apply(this, arguments);
	};
	
	//-- end arrays utilities
	
	lh.utils = {};
	lh.utils.langSelector = function(selectNode, langArray, changeFunc){
		$(selectNode).html(function(){
			var res = "";
			langArray.forEach(function(v, i) {
				res += "<option value=" + v + ">" + v + "</option>";
			});
			return res;
		});
		$(selectNode).change(changeFunc);
	};
	
	
	//utility for get keys/properties of an object
	lh.utils.getKeys = function(obj){
		var keys = [];
		for(var key in obj){
			keys.push(key);
		}
		return keys;
	};
	
	////timer management
	lh.utils.ta = new Array();
	
	lh.utils.addTevent = function(f,obj,t){
		ev = new Array();
		//ev[0] = Date.now()+t;
		ev.push(Date.now()+t);
		ev.push(f);
		ev.push(obj);
///		ev[1] = f;
		//ev[1] = typeof f === "function" ? f.call() : f;
		lh.utils.ta.push(ev);
	};
	
	lh.utils.processEvent = function(){
		//$("#mover").text("process " + Date.now());
		
		//$("#mover").text("process " + JSON.stringify(lh.utils.ta));
		torm = new Array();
		lh.utils.ta.forEach(function(r,i){
			if( r[0] <= Date.now()){
				//alert(JSON.stringify(r));
				//$("#mover").text("PING " + d[1] + "  " + i);
				val = typeof r[1] === "function" ? r[1].call(r[2]) : r[1];
				val ? torm.push(i) : ""; 
				
				//torm.push(i);
			}
		});
		//remove outdated element from array
		torm.forEach(function(t,i){
			lh.utils.ta.splice(t,1);
		});
		//$("#mover").text("process " + JSON.stringify(lh.utils.ta));
	};
	
	var processID;
	//
	lh.utils.startProcess = function(interval){
		processID = setInterval(
				function(){lh.utils.processEvent();},
				interval);
	};
	//TODO add a lh.utils.stopProcess
	
	
	//TODO : move to an utility class or better overload the rdf.fn
	//Check if a databank contain a particular triple
	lh.contains = function (databank, triple) {
		var match = $.rdf({databank : databank}, lh.history.ns)
			.where(triple.subject+" "+triple.property+" "+" "+triple.object);
		return !(match.length == 0);
	};
	
})();

//NS for graph function
//lh.graph = {};

//var tOut = Array();
var ltb ;
var tout; // timeout variable

//TODO : make and object for this
function initGraphDisplay(){
	var m = [20, 120, 50, 120],
	    //w = 1280 - m[1] - m[3],
	    //h = 800 - m[0] - m[2],
		w = 1280,
		h = 800,
	    tby = 0,
	    i = 0,
	    duration = 500,
	    //distance between the circle and the text
	    textOffset = 10
	    ;
	
	var tree = d3.layout.tree()
	    .size([h - m[0] - m[2], w - m[1] - m[3]])
	    
		;
	
	var diagonal = d3.svg.line()
			.interpolate("step-before")
			;
	
	//build toolbar zone
	var toolBarZone = d3.select("#chart").append("svg")
						.attr("id","toolBarZone")
						.attr("width", w)
						//.attr("height", h + m[0] + m[2])
						//TODO : define a global size for toolbar height
						.attr("height", 30)
						;
	var toolBarGraphOne = toolBarZone.append("g").attr("transform", "translate(" + m[3] + "," + tby + ")")
					.attr("id", "toolBarGraphOne");
	
	var toolBarGraphTwo = toolBarZone.append("g").attr("transform", "translate(" + w/2 + "," + tby + ")")
					.attr("id", "toolBarGraphTwo");
	
	//build graphics zone
	var svgZone = d3.select("#chart").append("svg")
					.attr("id","graphicsZone")
					.attr("width", w)
					.attr("height", h);
	
	var graphOne = svgZone.append("g").attr("transform", "translate(" + m[3] + "," + m[0] + ")")
		.attr("id", "graphOne");
	graphOne.transformArray = [m[3],m[0]];
	
	var graphTwo;
	initGraphTwo();
	
	function initGraphTwo(){
		graphTwo = svgZone.append("g").attr("transform", "translate(" + w/2 + "," + m[0] + ")")
		.attr("id", "graphTwo");
		graphTwo.transformArray = [w/2,m[0]];
	}
	
	//initscrollbarZone
	var scrollWidth = 15,
	scrollMargin = 15;
	
	function initScrollBarZone(graphName){
		var xt = graphName.transformArray[0] - scrollWidth - scrollMargin;
		graphName.hscroll = d3.select(graphName.node().ownerSVGElement).append("g")
		.attr("class","hscroll")
		.attr("transform","translate("+ xt +",0)");
		//(m[3]-scrollWidth-scrollMargin)
	}
	//TODO : init for graphTwo
	initScrollBarZone(graphOne);
	initScrollBarZone(graphTwo);
	//
	
	//init the graph zone for links
	/*var graphLink = svgZone.append("g")
		.attr("id", "graphLink");*/
	var graphLink = new lh.graph(svgZone.append("g").attr("id", "graphLink"));
	/*****
	 * Tool bar related code
	 */
	
	function openInfoBox(){
		$( "#info-box" ).dialog( "open" );
		log = "<p> Coming soon : </p><p> Display detailled informations when selecting a node.</p>";
		$("#info-box #infoZone").html(log);
	}
	
	function ltbBox(selector){
		var offset = 25;
		$(selector).css({
			'z-index': 10,
			'position':'absolute', 
			'top':(d3.event.pageY-offset),
			'left':(d3.event.pageX-offset)
			}).fadeIn('slow');
		$(selector+" button").click(function(){$(selector).fadeOut('slow')});
	}
	
	function initToolBar(tb,graphChoiceSelector,graphLangSelector){
		//TODO : see if we can create a data structure and build this toolbar automatically 
		var tPad = 40;
		
		//graph button
		tb.append("image")
			.attr("transform", "translate("+(tPad*0)+",0)")
			.attr("x",0).attr("y",0)
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 30 30")
			.attr("width",30).attr("height",30)
			.attr("xlink:href","img/document_32x32.png")
			.on("click", function(){
				ltbBox(graphChoiceSelector);
			})
		;
		
		//lang button
		tb.append("image")
			.attr("transform", "translate("+(tPad*1)+",0)")
			.attr("x",0).attr("y",0)
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 30 30")
			.attr("width",30).attr("height",30)
			.attr("xlink:href","img/flag_32x32.png")
			.on("click", function(){
				ltbBox(graphLangSelector);
			})
			//TODO : use mouseover/mouseout in place of click : see how to get the panel static while in
			/*
			.on("mouseover", function(){
				var test = this;
				var t= this.getBoundingClientRect();
				var y = this.getScreenCTM()
				var val = d3.event.pageX;
				$("#graphOneLangBox").css({'z-index': 10,'position':'relative', 'top':t.top,'left':t.left}).fadeIn('slow');
				$("#graphOneLangBox").mouseover(function(){this.show();});
				$("#graphOneLangBox").mouseout(function(){this.hide();});
			})
			.on("mouseout",function(){
				$("#graphOneLangBox").fadeOut('slow');
			})*/
		;
		
		//info button
		tb.append("image")
			.attr("transform", "translate("+(tPad*2)+",0)")
			.attr("x",0).attr("y",0)
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 30 30")
			.attr("width",30).attr("height",30)
			.attr("xlink:href","img/info_32x32.png")
			.on("click", openInfoBox)
		;
	}
	
	initToolBar(toolBarGraphOne,"#graphOneChoiceBox","#graphOneLangBox");
	initToolBar(toolBarGraphTwo,"#graphTwoChoiceBox","#graphTwoLangBox");
	
	
	
	/*** init display of the first graph if graph uri in parameter***/
	var graphOneURL = getURLargs()["uri"];
	if(graphOneURL){
		getGraph(graphOne,graphOneURL);
	};
	
	//loading the graphLink
	// !! use this when the 2 graphs are loaded or near to be loaded
	function loadGraphLink(){
		//alert("load graphlink");
		if((!graphOne.graphURI) || (!graphTwo.graphURI)){
			setTimeout(loadGraphLink,200);
		}
		else{
			getGraphLink(graphOne,graphTwo);
		}
	}
	
	//manage retrieve/destroy of graph when value changed
	//manage retrieve/destroy of graphLink
	//TODO : see how to use less parameters
	function graphChoiceChange(curGraphSelector,curLangSelector,curGraph,otherGraphSelector,otherLangSelector,otherGraph){
			var curVal = $(curGraphSelector).attr("value");
			var otherVal = $(otherGraphSelector).attr("value");
			//delete the curent graph
			if(curVal == '-1'){
				curGraph.selectAll("g.node,path.link")
					.transition()
					.duration(duration*2)
					//.attr("style", "fill:red")
					.attr("transform", "rotate(45 50 50) scale(1,1)")
					.remove();
				//remove the graph lang content
				$(curLangSelector).empty();
				//remove the graphLink content
				graphLink.svg.selectAll("path.mapLink")
					.transition()
					.duration(duration*2)
					//.attr("style", "fill:red")
					.attr("transform", "rotate(45 50 50) scale(1,1)")
					.remove();
			}else {
				getGraph(curGraph, curVal);
				//if another graph is already selected, get the graphLink
				if(otherVal != '-1'){
					//use timeout as graphTwo as to be loaded before process
					setTimeout(loadGraphLink,300);
				}
			}
	}
	
	$wait = $("<div id='waitBox' title='Please wait'><p>Data curently loading please wait...</p><p>Try to reload if it take too much time</div>")
				.dialog({
					autoOpen: false,
					autosize : true,
					modal: true
				});
	var wTout;
	//load graph list
	$.ajax({
		url : lh.server+"skosifier/graphlist/",
		dataType : "json",
		beforeSend : function(){
				wTout = setTimeout(function(){$wait.dialog("open");},300);},
		complete : function(){
			clearTimeout(wTout);
			$wait.dialog("close");},
		success: function(data){
			opt = "";
			//default value
			opt += "<option value='-1'>Choose the graph you want to map to.</option>";
			if (data.graphUri){
				data.graphUri.forEach(function (d){
					opt += "<option value="+d+">"+d+"</option>";
				});
			}else{alert("No graph loaded in this repository, please import one !");}
			$("#graphOneChoice").html(opt);
			if(graphOneURL){ //load the default value if passed in url
				$("#graphOneChoice").val(graphOneURL);
			}
			$("#graphTwoChoice").html(opt);
			//TODO : do the same default loading when paramter for 2 graph exist
			$("#graphOneChoice").change(function(){
				graphChoiceChange("#graphOneChoice","#graphOneLang",graphOne,"#graphTwoChoice","#graphTwoLang",graphTwo);
			});
			$("#graphTwoChoice").change(function(){
				graphChoiceChange("#graphTwoChoice","#graphTwoLang",graphTwo,"#graphOneChoice","#graphOneLang",graphOne);
			});
			/*$("#graphTwoChoice").change(function(){
				val = $(this).attr("value");
				//delete the curent graph
				if(val == '-1'){
					graphTwo.selectAll("g.node,path.link")
						.transition()
						.duration(duration*2)
						//.attr("style", "fill:red")
						.attr("transform", "rotate(45 50 50) scale(1,1)")
					.remove();
					//remove the graph lang content
					$("#graphTwoLang").empty();
				}else {
					getGraph(graphTwo, val);
					//when a graph is selected, get the graphLink
					//use timeout as graphTwo as to be loaded before process
					setTimeout(loadGraphLink,300);
				}
			});*/
		}
	});
	
	/**
	 * end toolbar related code
	 */
	
	/************** end initialization of things *******/
	//TODO : REMOVE this and use lh.sem.getPropValue instead
	function getValues(propObj,prop){
		if (propObj){
			return propObj[prop];
		}
		else return undefined;
	}
	
	function getPropValue(prop, d, lang){
		if(!lang) lang = d.ingraph.curLang;
		result = d[prop];
		if (d[prop] instanceof Array){
			result = d[prop].filter(function(p){ return p["@language"] == lang;})[0];
		}
		return getValues(result,"@literal");
	}
	
	/********** Get and set labels on d objects **/
	//commodity function to get and set label to extract
	//TODO : use the getProp val intead
	function getLabel(d){
		//res = lh.sem.getPropValue("prefLabel",d);
		//if (!res) res = "---undefined---";
		//return res;
		var res = lh.sem.getPropValue("skos:prefLabel",d);
		res.length == 0 ? res = "---undefined---" : res = res[0].value.value;
		return res;
	}
	
    function setLabel(d,label){
		if (d.prefLabel == null){
			//c'est la racine, voir commment on le traite
			//return "---racine---";
            return d;
		}
		else{
			d.prefLabel.filter(function(p){ return p["@language"] == d.ingraph.curLang;})[0]["@literal"] = label
			return d;
                        
		}
	}
	     //end function to extract
	
	/*********** end get and set labels **/
	
	function collapsed(d){
		return d._children != null;
	}
	
	/*******************************
	 * Interaction stuff
	 */
	
	/**** clic and double clic */
	
	// Toggle children on click on circles
	function click(d) {
	  if (d.children) {
	    d._children = d.children;
	    d.children = null;
	  } else {
	    d.children = d._children;
	    d._children = null;
	  }
	  lh.graph.update(d.ingraph, d);
	}
	
	$("#info-box").dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		//modal: true,
		buttons: {
			/*"Save changes": function() {
				
				n = lh.modify.save();
				update(n.ingraph,n);
				$( this ).dialog( "close" );
			},*/
			"Close": function() {
				
				//n = lh.modify.cancel();
				//update(n.ingraph,n);
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			
		}
	});
	
	
	lh.modify.initModifyUI("#dialog-form");
	
	function doubleClick(d) {
		/*localEvent.doubleClick = true;
		d3.event.stopPropagation();
		d3.event.preventDefault();*/
		
		//create the dialog form 
		// 1) get avalaible language for the graph
		// 2) get list of properties and existing properties in this object (see A)
		// 3) display all properties as a tab
		// 4) seek for modification and update only modified fields
		// 5) propose adding of new languages and / or new properties (for avalaibles)
		//buildDialog(d);
		lh.modify.buildDialog(d);
		//A) call the endpoint like in import then result.forEach(if(object[v] != null) ? createTab : addToPropertiesToAddList;);
		$( "#dialog-form" ).dialog( "open" );
		
	
	  /*setLabel(d,"changed");
	
	  update(d.ingraph, d);*/
	}
	/**** end clic and double clic */
	
	/*********** link creation ***********/
	
	var onCreateLink = false;
	var nodeLinkObj = null;
	
//	var $tolBox = $("#TOL-box").dialog({
//		autoOpen: false,
//		autoSize : true,
//		buttons: {
//			"Save changes": function() {
//				alert("TODO : function that save");
//				/*n = lh.modify.save();
//				update(n.ingraph,n);*/
//				$( this ).dialog( "close" );
//			},
//			"Close": function() {
//				
//				//n = lh.modify.cancel();
//				//update(n.ingraph,n);
//				$( this ).dialog( "close" );
//			}
//		},
//		close: function() {
//			
//		}
//	});
	var selectAValueMessage = "Select a value";
	//init the content of the TOLDialog
	function initTOLDialogContent(tolBox){
		if (skosOnto.getReferencesOK){
			var reflinks = skosOnto.getReferences();
			var valSelectText = selectAValueMessage; 
			if (reflinks[0] != valSelectText){
				reflinks.splice(0, 0, valSelectText);
			}
			var opt = $("<select id='tolSelect' size='1'> </option>");
			lh.utils.langSelector(opt,reflinks, function(){
				//alert("value changed !");
			});
			tolBox.html(opt);
		}
		else{
			setTimeout(function(){initTOLDialogContent(tolBox);},100);
		}
	}
	//setTimeout(function(){initTOLDialogContent();},100);
	
	//end init the TOLDialog content
	function TOLdialog(nl,x,y){
		
		var $tolBox = $("#TOL-box").dialog({
			autoOpen: false,
			autoSize : true,
			position : [x,y],
			buttons: {
				"Save changes": function() {
					//alert("TODO : function that save");
					/*create a suitable object*/
					//TODO : put the creation of this object before : this could be the nl object
					var selNode = $("#tolSelect")[0];
					var selectedProp = selNode.options[selNode.selectedIndex].value;
					if(selectedProp != selectAValueMessage){
						/*var semObj = {
								"@subject" : nl.source["@subject"],
								selectedProp : nl.target["@subject"]};*/
						
						alert("use nl.source.uri");
						var s = nl.source.uri;
						var p = $.rdf.resource("skos:"+selectedProp,lh.history.ns);
						var o = nl.target.uri;
						//lh.history.newTriple(s,p,o);
						//TODO : remove this global reference. Use a local one instead
						//graphLink.history.newTriple(s,p,o);
						graphLink.newTriple(s,p,o);
						/*alert("test results");
						var serializer = new XMLSerializer();
						var localdump = graphLink.history.rdfChanges.dump({format:'application/rdf+xml'});
						alert(serializer.serializeToString(localdump));*/
						
						
						
						
						
						
						
						
						//commit changes to the server
						//alert("TODO: the commit !");
						graphLink.commit();
						//lh.modify.save();
						
					}
					
					
					$( this ).dialog( "close" );
				},
				"Close": function() {
					
					//n = lh.modify.cancel();
					//update(n.ingraph,n);
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				
			}
		});
		
		initTOLDialogContent($tolBox);
		
		//$tolBox.dialog("option", "position", [x,y] );
		//lh.history.createLocalChange(graphLink);
		$tolBox.dialog("open");
	}
	
	function linkMouseMove(){
		//allow click event to passthrow the link
		var offset = 3;
		mp = d3.svg.mouse(graphLink.svg.node());
		
		//get the starting point coord
		var pt = nodeLinkObj.node().getPointAtLength(0);
		nodeLinkObj.attr("d", function(r) {
			return diagonal([[pt.x,pt.y],[mp[0]+offset,mp[1]+offset]]);
		});
		
	}
	
	//TODO : remove this ??
	function createLinkClick(d){
		nl = {};
		nl.source = d;
		//TODO : see how to remove the use of nl.sourceDOM
		nl.sourceDOM = this.parentNode.parentNode;
		mapLinks.push(nl);
		
		//create an svg point 
		var pt = (nl.sourceDOM.ownerSVGElement || nl.sourceDOM).createSVGPoint();
		
		//TODO : use js native selector ? better perf than the D3 one ?
		pt.x = d3.select(nl.sourceDOM).select("text").node().getComputedTextLength() + textOffset;
		pt.y = 0;
		
		pt = pt.matrixTransform(nl.sourceDOM.getCTM());
		
		nodeLinkObj = graphLink.svg.append("path")
			.attr("class", "tempLink")
			.attr("d", function(r) {
	    	  //return diagonal([[60, 60],[pt.x,pt.y]]);
				return diagonal([[pt.x,pt.y],[pt.x,pt.y]]);
	      });
		
		d3.select(nl.sourceDOM.ownerSVGElement).on("mousemove",linkMouseMove);
		onCreateLink = true;
	}
	
	function targetLinkClick(d){
		if (nodeLinkObj){
			
			onCreateLink = false;
			nl = mapLinks.pop();
			
			//the event is on the text, we want the parent g node
			nl.target = d;
			nl.targetDOM = this.parentElement;
			mapLinks.push(nl);
			
			d3.select(nl.sourceDOM.ownerSVGElement).on("mousemove",null);
			
			UpdateGraphLink();
			
			//remove the nodeLinkObj from the dom
			nodeLinkObj.remove();
			nodeLinkObj = null;
			
			var x = d3.event.clientX+10;
			var y = d3.event.clientY+10;
			TOLdialog(nl,x,y);	
		}
	}
	
	
	/*********** end link creation ***********/
	
	/******** graphlink display **********/
	//l = {};
	mapLinks = new Array();
	//graphLink();
	
	function getGraphLink(g1,g2){
		
		$.ajax({
			url : lh.server+"skosifier/graphlink?graphOne="+g1.graphURI+"&graphTwo="+g2.graphURI,
			headers : {"Accept":"application/rdf+xml"},
			dataType : "xml",
			success: function(data){
				/*graphLink.rdf = {};
				graphLink.rdf.databank = $.rdf.databank([],
	                      	{ base: 'http://www.example.org/',
                    		namespaces: { 
                    			skos: 'http://www.w3.org/2004/02/skos/core#',
                    			map: 'http://www.culture-terminology.org/ontology/mapping#'} }
				);
				graphLink.rdf.databank.load(data,{});*/
				var db = $.rdf.databank([],lh.history.ns);
				db.load(data,{});
				//TODO : ?? create and endpoint for getting graph(s) uri ?? 
				//get the graphURI, normally unique for this graph
				//graphLink.graphURI = $.rdf({databank : graphLink.rdf.databank})
				var graphURI = $.rdf({databank : db})
					.prefix('map', 'http://www.culture-terminology.org/ontology/mapping#')
					.where("?root a map:graphMapping")
					[0].root.value
					;
				//graphLink.seturi(graphURI);
				//displayGraphLink(graphLink);
				
				graphLink.seturi(graphURI, function(){displayGraphLink(graphLink);});
				
				/*queue(1)
            		//.defer(function(){return getRDFGraph(uri);})
        			.defer(graphLink.seturi,graphURI)
        			.defer(displayGraphLink,graphLink)
        			.await(function(error, results) {
        				alert("YYOOOOOO");
        				alert(results);
        			});*/
				
				//alert("TODO : the rest !");
				
			}
		});
		
	}
	
	function displayGraphLink(gr){
		//alert("In the display !!");
		
		//var semNodes = $.rdf({databank : gr.rdf.databank})
		var semNodes = $.rdf({databank : gr.rdf})
				.prefix('map', 'http://www.culture-terminology.org/ontology/mapping#')
				//.where("?id ?p ?children")
				.where("?sourceURI ?p ?targetURI")
				.filter(function(){
					//alert(this.id.value+" ; "+this.id.toString() + " : " + gr.graphURI);
					//alert(this.id.value != gr.graphURI);
					return this.sourceURI.value != gr.graphURI;
				})
		;
		
		//TODO : as on D3 for optimize it : who to link 2 independant graphs with a third one ?
		var allNodes = svgZone.selectAll("g.node");
		
		semNodes.each(function(i,v){
			//alert(i);
			/*v.source = svgZone.selectAll("g.node").data([v.sourceURI],function(d){
				//TODO : remove this little hack when graph will be sem managed
				if(d["@subject"]){return d["@subject"];}
				return d.value;
			});
			v.target = svgZone.selectAll("g.node").data([v.targetURI],function(d){
				//TODO : remove this little hack when graph will be sem managed
				if(d["@subject"]){return d["@subject"];}
				return d.value;
			});*/
		});
		
		//TODO : have a clean impl beetween stored links and created ones
		// !!! use another property "storedMapLink"
		var link = graphLink.svg.selectAll("path.maplink").data(semNodes, function(d){
			return d.id || (d.id == ++i);
		});
		
		// Enter any new links at the parent's previous position.
		  link.enter().insert("path", "g")
		      .attr("class", "mapLink")
		      //.attr("text", function(d){ return "YO " + d.target.y;})
		      .attr("d", function(d) {
		    	  //return getCTMDiagonal(d);
		    	  return getCTMdiag(d.source,d.target);
		      })
		      ;
			
			//update link position if nodes moved
			link.transition().duration(duration).attr("d", function(d){
				return getCTMDiagonal(d);
			});
		
		  link.exit().remove();
		
		/*var nid = graphOne.selectAll("g.node").data(semNodes,function(d){
			//TODO : remove this little hack when graph will be sem managed
			if(d.source){return d.source.value;}
			return d["@subject"];
		});
		
		//get nodes from the children
		var nchild = graphTwo.selectAll("g.node").data(semNodes,function(d){
			//TODO : remove this little hack when graph will be sem managed
			if(d.target){return d.target.value;}
			return d["@subject"];
		});
		
		var l = tree.links(nid);*/
		
		//alert("end display");
		///test with node.id
		
	}
	
	function UpdateGraphLink(){
		//var graphLink = svgZone.append("g").attr("transform", "translate(" + m[3] + "," + m[0] + ")")
		//.attr("id", "graphLink");
		//mapLinks = [1,2,3,4,5,6];
		
		var filtered = mapLinks.filter(function(d,i){
			return (d.source.displayed && d.target.displayed);
		});
		
		var link = graphLink.svg.selectAll("path.mapLink")
			.data(filtered, function(d,i){
			return d.id || (d.id = ++i);});
	
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g")
	      .attr("class", "mapLink")
	      //.attr("text", function(d){ return "YO " + d.target.y;})
	      .attr("d", function(d) {
	    	  return getCTMDiagonal(d);
	      })
	      ;
	    //TODO : voir pour avoir une transition clean
	    /*.transition()
	      .duration(duration)
	     //.attr("d", diagonal)
	    .attr("d", function(d) {
	        return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
	      })
		;*/
		
		//update link position if nodes moved
		link.transition().duration(duration).attr("d", function(d){
			return getCTMDiagonal(d);
		});
	  // Transition links to their new position.
	  /*link.transition()
	      .duration(duration)
		.attr("d", function(d) {
			return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
	      })
		;
		
	
	  // Transition exiting nodes to the parent's new position.
	  link.exit().transition()
	      .duration(duration)
	      .attr("d", function(d) {
	    	  return diagonal([[source.x,source.y],[d.target.x,d.target.y]]);
	      })
	      .remove();
	*/
	  
	  link.exit().remove();
		
		/*
		graphLink.append("path")
	      .attr("class", "link")
	      //.attr("text", function(d){ return "YO " + d.target.y;})
	      .attr("d", function(d) {
	        //return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
	    	  return diagonal([[15,20],[30,30]]);
	      })
		*/
	}
	
////////// Graph for link
	
	function getPointForLink(n){
		//var pt = (n.ownerSVGElement || n.source).createSVGPoint();
		var pt = n.ownerSVGElement.createSVGPoint();
		
		//TODO : use js native selector ? better perf than the D3 one ?
		pt.x = d3.select(n).select("text").node().getComputedTextLength() + textOffset;
		pt.y = 0;
		
		return pt.matrixTransform(n.getCTM());
	}
	
	function getCTMDiagonal(d){
		
		/*var tt = d.source.ingraph.selectAll("g.node");
		var oneN = tt.data([d.source], function(v){
			return v.id;
		});*/
		var sourceDOM = d.source.ingraph.selectAll("g.node").data([d.source], function(v){
			//return v.id;
			return v["@subject"];
			});
		var targetDOM = d.target.ingraph.selectAll("g.node").data([d.target], function(v){
			//return v.id;
			return v["@subject"];
			});
		
		//return getCTMdiag(sourceDOM,targetDOM);
		ptSource = getPointForLink(sourceDOM.node());
  	  	ptTarget = getPointForLink(targetDOM.node());
  	  
  	  	//TODO : see if it's on the right or left graph
  	  	//and then choose if target point is on the start or the end of the text
  	  	return diagonal([[ptSource.x,ptSource.y],[ptTarget.x/2,ptSource.y],[ptTarget.x,ptTarget.y]]);
  	  	
	}
	
	function getCTMdiag(sourceDOM,targetDOM){
		ptSource = getPointForLink(sourceDOM.node());
	  	ptTarget = getPointForLink(targetDOM.node());
	  
	  	//TODO : see if it's on the right or left graph
	  	//and then choose if target point is on the start or the end of the text
	  	return diagonal([[ptSource.x,ptSource.y],[ptTarget.x/2,ptSource.y],[ptTarget.x,ptTarget.y]]);
	}
	
	/********* end graphLink display ****/
	
	
	/*********** Drag and drop ****/
	
	//////////// mouseOver Related code
	var target; 
	var onltb = false;
	var DandD = {};
	var localEvent = {};
	DandD.onDragAndDrop = false;
	
	function moltb(d){
		d3.select("#mover").text("MO TOOL BAR");
		clearTimeout(tout);
		onltb = true;
	}
	
	function moutltb(d){
		onltb = false;
	}
	
	
	
	
	var curPnode;
	//var ltb ;
	//var tout; // timeout variable
	 
	function buildToolBar(parentNode){
		
		var txtNode =  d3.select(parentNode).select("text");
		txtNode.attr("fill", "orange");
		
		ltbnode = d3.select(parentNode).append("g");
		
		//drag and drop
		ltbnode
		.attr("transform", "translate(" + (txtNode.node().getComputedTextLength() + 10) + "," + (-25) + ")")
		.attr("id", "localToolBar")
		.append("image")
			.attr("x",0).attr("y",0)
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 30 30")
			.attr("width",30).attr("height",30)
			.attr("xlink:href","img/transfer-down_up.png")
			//TODO : put the dragdrop event on the text, but as D3 V2.7.4 there is a conflict with click event
			// start with this and do a bug example : http://bl.ocks.org/1378144
			.call(dragdrop)
		;
		
		//create link
		ltbnode
			.attr("transform", "translate(" + (txtNode.node().getComputedTextLength() + 10) + "," + (-25) + ")")
			.attr("id", "localToolBar")
			.append("image")
				.attr("transform", "translate(30,0)")
				.attr("x",0).attr("y",0)
				.attr("preserveAspectRatio","xMidYMid meet")
				.attr("viewBox","0 0 30 30")
				.attr("width",30).attr("height",30)
				.attr("xlink:href","img/affiliation-abstract.png")
				.on("click", createLinkClick)
				.on("mouseover",moltb)
				.on("mouseout",moutltb)
			;
		
		return ltbnode.node();
	}
		
	
	//TODO : rename to : attach
	function mo(d,i){
		
		if (!DandD.onDragAndDrop){
			yo = "";
			if (ltb){
				rmTB(ltb);
				clearTimeout(tout);
			}
			ltb = buildToolBar(this);
		}
		else {
			target = d;
			var txtNode =  d3.select(this).select("text");
			txtNode.attr("fill", "red");
		};
	}
	
	function rmTB(pnode){
		//alert("totto");
		
		d3.select(pnode.parentNode).select("text").attr("fill", null);
		
		//pnode.remove();
		gnode = d3.select(pnode).selectAll("g #localToolBar");
		gnode.remove();
		ltb = undefined;
		return true;
	}
	
	
	function mout(d,i){
		if(!DandD.onDragAndDrop){
			node = this;
			//lh.utils.addTevent(rmTB,this, 5000);
			//ltb.remove();
			tout = setTimeout( function(){rmTB(node);}, 1000);
		}
		else{
			d3.select(this).select("text").attr("fill", null);
		}
	}	
	////////////end mouseOver Related code
	
	function dragstart(d,i){
		
		DandD.onDragAndDrop = true;
		
		//nodes and links that mouves
		var nodes = tree.nodes(d);
		
		//var posi = d3.mouse(d.ingraph[0][0]);
		var offset = {};
		
		// Normalize for fixed-depth.
		//required for not have node anywhere... see why required
		nodes.forEach(function(d , i) { 
			d.x = d.depth * 20 ; 
			d.y = i * 15 ;
		});
		
		//DandD.node= d.ingraph.selectAll("g.node[rootNode=\""+d.uri+"\"]")
		DandD.node= d.ingraph.selectAll("g.node")
	      .data(nodes, function(d) { 
	    	  return d.uri;
	    	  });
		
		//DandD.link = d.ingraph.selectAll("path.link[rootNode=\""+d.uri+"\"]")
		DandD.link = d.ingraph.selectAll("path.link")
	      .data(tree.links(nodes), function(d) { 
	    	  //return d.target.id; 
	    	  return d.source.uri+"=>"+d.target.uri;
	    	  });
		
	};
	function dragmove(d,i){
		var mv = {};
		mv.x = d3.event.x+10;
		mv.y = d3.event.y+10;
		//var posi = d3.mouse(d.ingraph[0][0]);
		// Update the nodes…
		
		DandD.node.attr("transform", 
				function(r){
					r.x += d3.event.x+10;
					r.y += d3.event.y+10;
					return "translate(" + r.x + "," + r.y + ")";
				}
				);
		
		// Update the links…
		  // Transition links to their new position.
		  DandD.link.attr("d", function(d) {
				return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
		      })
			;
		
		//if drag-drop directly on the text (see bug describe in this file) : 
		//pnode = d3.select(this.parentNode);
		//when drag-drop call on the localTool bar
		/*pnode = d3.select(this.parentNode.parentNode);
		
		d.x += d3.event.x+10;
		d.y += d3.event.y+10;
		
		//d3.select(this.parentNode).attr("transform", "translate(" + d.x + "," + d.y + ")");
		pnode.attr("transform", "translate(" + d.x + "," + d.y + ")");*/
	};
	
	function dragend(d,i){
		
		//if the drag move to the same place, or to a different graph, do nothing
		if( (target != d) && (d.ingraph == target.ingraph)){
			
			//TODO : history management and sending for this modification
			//for the history and triple management, add a .remove and .add to the graph, this methods deal with local graph and history
			if(d.parent){
				target.ingraph.rdf.databank.remove(d.uri +" skos:broader "+d.parent.uri);
			}
			//create the new link beetween d and the target
			//todo : use the {?parent skos:relation ?children} tip 
			//for example here it's an inverse relation {?child skos:broader ?parent}
			target.ingraph.rdf.databank.add(d.uri +" skos:broader "+target.uri);
			
			
			//remove the object from the display
			//d3.select(this.parentNode.parentNode).remove();
			
			//d3.select(this).remove();
			
			//remove this object from his parent's children list
			/*childrenOfParent = d.parent.children;
			childrenOfParent.splice(childrenOfParent.indexOf(d), 1);
			
			//put this object as children of the target (his new parent)
			childrenOfTarget = collapsed(target) ? target._children : target.children;
			//if this is the first children of the target
			if(childrenOfTarget == null){
				//collapsed is false for sure (no children), so we create a new target.children
				target.children = new Array();
				childrenOfTarget = target.children;
			}
			childrenOfTarget.push(d);*/
			lh.graph.update(target.ingraph, target);
		}
		//if not respect contraint, redraw
		else{ lh.graph.update(d.ingraph,d);}
		DandD.onDragAndDrop = false;
		
	};
	
	var dragdrop = d3.behavior.drag()
					.on("dragstart", dragstart)
				    .on("drag", dragmove)
				    .on("dragend", dragend);
	
	/*********** End drag and drop ****/
	
	/********* History ******/
	//@Deprecated
	//TODO : use lh.graph and lh.histo objects instead
	function getGraphHistory(graphName, graphURI){
		$.ajax({
			url : lh.server+"skosifier/history?for="+graphURI,
			headers : {"Accept":"application/rdf+xml"},
			dataType : "xml",
			success: function(data){
				graphName.history = {};
				//TODO : use the lh.history.ns for databank's options
				graphName.history.rdfChanges = $.rdf.databank([],
				                      { base: 'http://www.example.org/',
				                      namespaces: { 
				                      	skos: 'http://www.w3.org/2004/02/skos/core#',
				                        h: 'http://www.culture-terminology.org/ontoHisto/'} }
					);
				/*alert("history");
				alert(graphURI);
				var serializer = new XMLSerializer();
				alert(serializer.serializeToString(data));
				alert("END history");*/
				
				graphName.history.rdfChanges.load(data,{});
				//get the first history node, normally unique for this graph
				graphName.history.hroot = $.rdf({databank : graphName.history.rdfChanges})
					.prefix('h', 'http://www.culture-terminology.org/ontoHisto/')
					.where("?root a h:history")
					.where("?root h:historyOf <"+graphURI+">")
					[0].root.value
					;
			}
		});
	}
	/********* end history *****/
	
	/**** get datas ****/
	
	function getGraph(graphName, graphURI){
		
		//get Graph history
		getGraphHistory(graphName, graphURI);
		
		//get Graph data
		$.ajax({
			url : lh.server+"skosifier?uri="+graphURI,
			//headers : {"Accept":"application/json"},
			//dataType : "json",
			headers : {"Accept":"application/rdf+xml"},
			dataType : "xml",
			success: function(data){
				//load sem data
				//alert("success TODO : sem load");
				graphName.rdf = {};
				graphName.rdf.databank = $.rdf.databank([],
	                      	{ base: 'http://www.example.org/',
                    		namespaces: { 
                    			skos: 'http://www.w3.org/2004/02/skos/core#'
                    			//, map: 'http://www.culture-terminology.org/ontology/mapping#'
                    			}
	                      	}
				);

				graphName.rdf.databank.load(data,{});
				//alert("end load");
				//end loading sem data
				graphName.graphURI = graphURI;
				displayGraph(graphName, data);
				
			}
		});
	}
	
	/**** end get datas ****/
	
	/*** language management ***/
	
	function langSelector(selectNode, langArray, changeFunc){
		$(selectNode).html(function(){
			res = "";
			langArray.forEach(function(v, i) {
				res += "<option value=" + v + ">" + v + "</option>";
			});
			return res;
		});
		$(selectNode).change(changeFunc);
	}
	
	//language selection for graph
	function graphLangSelector(graphName){
		var selectmenu;
		graphName === graphOne ? selectmenu =$("#graphOneLang") : selectmenu = $("#graphTwoLang");
		langSelector( selectmenu,
				graphName.langArray,
				function(){ //run some code when "onchange" event fires
					graphName.curLang = this.options[this.selectedIndex].value; 
					lh.graph.update(graphName,graphName.root);
				});
	}
	
	/*** end language management ***/
	
	function displayGraph(graphName, json){
		
		//TODO : retrive lang information from the json
		graphName.langArray = ["fr","nl","en"];
		graphName.curLang = graphName.langArray[0];
		graphLangSelector(graphName);
		
		//end lang hack
		
		function getChildren(d){
			var globD = d;
			d.children = objWithBroader.filter(function(p){ return p.broader == globD["@subject"];});
			//set to null for saying "no children" and get the circle white
			d.children.length == 0 ? d.children = null : d.children.forEach(getChildren); 
			//get a reference in each node to the graph
			d.ingraph = graphName;
		}
		
		function collapse(d) {
		    if (d.children) {
		      d._children = d.children;
		      d._children.forEach(collapse);
		      d.children = null;
		    }
		  }
		
		graphName.root = {};
		
		graphName.root.x0 = 10;
		graphName.root.y0 = 0;
	
		
		lh.graph.update(graphName, graphName.root);
	
	}
	
	//scroll bar related code
	function scrollDrag(){
		var y = parseInt(d3.select(this).attr("y")),
        ny = y + d3.event.dy,
        //w = parseInt(d3.select(this).attr("width")),
        hb = parseInt(d3.select(this).attr("height")),
        //factor = parseInt(d3.select(this).attr("factor"))
        factor = d3.select(this).attr("factor")
        //f, nf, new_data, rects;
        ;

		if ( ny < 0 || ny + hb > h ) return;

		//d3.select(this).attr("x", nx);
		d3.select(this).attr("y", ny);
		//var yo = "g #"+d3.select(this).attr("graphRef");
		
		var gr = d3.select("g#"+d3.select(this).attr("graphRef"));
			//.attr("transform","translate(" + m[3] + "," + (m[0] - y) + ")")
		var xt = gr.node().getCTM();
		gr.attr("transform","translate(" + xt.e + "," + (m[0] - (ny * factor)) + ")")
			;
		UpdateGraphLink();
	}
	
	
	
	function scrollbar(graphName,nodes){
		//horizontal scrollbar, y position of the last node is > of the graph size
		var ygm = nodes.last().y;
		//alert(ygm);
		//TODO : clean the m[2], find a better / more close step
		//have a look to attr height of the bar
		var oversize = ygm - h +m[0] +m[2];
		if (oversize > 0){
			//alert("build scroll");
			//TODO ? : put the g.hscroll as object of graphName ?? (as here we get the svg root of the graph)
			//var nt =graphName.node().ownerSVGElement;
			//n = graphName.node();
			
			/*var hscroll = d3.select(graphName.node().ownerSVGElement).append("g")
							.attr("class","hscroll")
							.attr("transform","translate("+ (m[3]-scrollWidth-scrollMargin) +",0)");
			*/
			//var rect = hscroll.append("rect")
			//var scn = d3.select(graphName.hscroll.node()).select("rect");
			var scn = graphName.hscroll.select("rect");
			//set a min size for the scrollbar
			var minSize = 50;
			var targetSize = h-oversize < 0 ? minSize : h-oversize ;
			var factor = oversize/h < 1 ? 1 : oversize/(h - minSize);
			if(!scn.empty()){
				scn.attr("height", targetSize);
				scn.attr("factor", factor);
			}
			else{
				graphName.hscroll.append("rect")
	            //.attr("transform", "translate(0, " + (height + margin.bottom) + ")")
				
				//reference to graph in order to easyli access to transform when dragging
				.attr("graphRef",d3.select(graphName.node()).attr("id"))
	            .attr("class", "mover")
	            .attr("x", 0)
	            .attr("y", 0)
	            //.attr("height", selectorHeight)
	            //.attr("width", Math.round(parseFloat(numBars * width)/data.length))
	            .attr("height", targetSize)
	            .attr("factor", factor)
	            .attr("width", scrollWidth)
	            .attr("pointer-events", "all")
	            //.attr("cursor", "ew-resize") // for horizontal
	            .attr("cursor", "ns-resize")
	            .call(d3.behavior.drag().on("drag", scrollDrag));
			}
		}
		else{
			//alert("too");
			var sb = graphName.hscroll.select("rect");
			if (!sb.empty()){
				
				//set tranform of the graph to origin
				//d3.select("g#"+sb.attr("graphRef")).attr("transform","translate(" + m[3] + "," + m[0] + ")");
				var xt = graphName.transformArray[0];
				d3.select("g#"+sb.attr("graphRef")).attr("transform","translate(" + xt + "," + m[0] + ")");
				//alert("do the remove of the bar");
				sb.remove();
			}
			
		}
		
	}
	
	//TODO : remove the source element as it's the graphName.root
	//TODO : rename as updateDisplay()
	lh.graph.update = function(graphName, source) {
		updateGraphDisplay(graphName, source);
		//displayNodes(graphName, source,source,source);
		d3.transition().delay(duration).duration(duration/2)
			.each("end", UpdateGraphLink);
		//UpdateGraphLink();
	}
	
	function updateGraphDisplay(graphName, source) {
		var ns = { base: 'http://www.example.org/',
        		namespaces: { 
        			skos: 'http://www.w3.org/2004/02/skos/core#'
        			//, map: 'http://www.culture-terminology.org/ontology/mapping#'
        			}
              	};
		
		//getRoots means get all objects with no parents (skos:broader)
		graphName.getRoots = function(){
			//filter on the global graph
			//var diff1 = r1.except(r2);
			var allConcepts = $.rdf({databank : this.rdf.databank})
    				.prefix("skos","http://www.w3.org/2004/02/skos/core#")
    				.where("?uri a skos:Concept");
			
			//allConcepts = $.rdf.databank(allConcepts,ns);
			
			var allConceptsWithProps = $.rdf({databank : this.rdf.databank})
    					.prefix("skos","http://www.w3.org/2004/02/skos/core#")
    					.where("?uri a skos:Concept")
    					//TODO : configurable props
    					.where("?uri skos:broader ?parent");
			var arr = [];
			allConceptsWithProps.each(function(i,d){
				//alert(i);
				arr.push(d.uri);
			});
			//allConceptsWithProps = $.rdf.databank(allConceptsWithProps,ns);
			//all concepts without this props
			//var AllConceptsWithoutProps = allConcepts.except(allConceptsWithProps);
			var AllConceptsWithoutProps = allConcepts.filter(function(i,d){
				//alert(allConceptsWithProps[d.uri]);
				return arr.indexOf(d.uri) < 0 ;
				
			});
			
			if(!graphName._roots) graphName._roots = [];
			
			//as lazyUnion need array, transform object to array
			var AllConceptsWithoutPropsArray = toArray(AllConceptsWithoutProps);
			
			//lazy union for only get elements in both arrays ie remove old elements in graphName._roots
			graphName._roots.lazyUnion(function(a,b){
							return a.uri == b.uri;
						},
						AllConceptsWithoutPropsArray);
			
			//lazy merge in order to add new elements from the request to the _root array
			graphName._roots.lazyMerge(function(a,b){
						return a.uri == b.uri;
					},
					AllConceptsWithoutProps);
			
			//return AllConceptsWithoutProps;
			return graphName._roots;
		};
		var gRoots = graphName.getRoots();
		//alert("test groots");
		
		//add the ingraph property for all roots
		gRoots.forEach(function(d,i){
			d.ingraph = graphName;
		});
		
		//TODO : create a for each gRoots and manage placing of them
		//var tempRoot = gRoots[0];
		
		/*** children computation **/
		graphName.getChildren = function(d){
			var childrens = $.rdf({databank : graphName.rdf.databank})
					.prefix("skos","http://www.w3.org/2004/02/skos/core#")
					.where("?uri skos:broader "+d.uri);
			//transform to array as used by D3
			var childarr = [];
			childrens.each(function(i,d){
				//alert(i);
				d.ingraph = graphName;
				childarr.push(d);
			});
			
			if(childarr.length == 0) childarr = undefined;
			
			//if d don't have ._children nor .children, init as collapsed
			if (!d._children && !d.children){
				d._children = childarr;
				return [];
			}
			//if d have ._children (children collapsed), just update _children
			if(d._children){
				//lazy union and merge for remove element in _children not in childarr and then add new childarr elements
				d._children.lazyUnionAndMerge(function(a,b){
					return a.uri == b.uri;
				},
				childarr);
				return [];
			}
			//last case, if d have children, update it and return children
			d.children.lazyUnionAndMerge(function(a,b){
				return a.uri == b.uri;
			},
			childarr);
			return d.children;
		};
		
		//children computation
		//if performance problem with sparql children computation, use the children computation during init as used in the old implementation.
		tree = tree.children(graphName.getChildren);
		
		//end children computation
		var offset = {};
		offset.x = 0;
		offset.y = 0;
		
		//remove root node that can be merge as sub-nodes
		var n = graphName.selectAll("g.node[isRoot='true']")
	      .data(gRoots, function(d) { 
	    	  return d.uri;
	    	  });
		n.exit().remove();
		
		//display all sub-nodes of roots
		gRoots.forEach(function(n,i){
			offset = displayNodes(graphName,source,n,offset);
			offset.y += 20;
		});
		
		
	}
	
	//TODO : remove the source param and get the position of the last node
	function displayNodes(graphName, source, rootNode, offset){
		

		  // Compute the new tree layout.
		  //var nodes = tree.nodes(graphName.root);
		var nodes = tree.nodes(rootNode);
		  
		  // Normalize for fixed-depth.
		  nodes.forEach(function(d , i) { 
			  d.x = offset.x + d.depth * 20 ; d.y = offset.y + i * 15 ;
			  });
		  
		  //build a scrollbar ?
		  scrollbar(graphName,nodes);
		  
		  //alert("g.node[\""+rootNode.uri+"\"]");
		  // Update the nodes…
		  var node = graphName.selectAll("g.node[rootNode=\""+rootNode.uri+"\"]")
		      .data(nodes, function(d) { 
		    	  //return d.id || (d.id = ++i); 
		    	  //return d["@subject"];
		    	  return d.uri;
		    	  });
		
		  // Enter any new nodes at the parent's previous position.
		  var nodeEnter = node.enter().append("g")
		      .attr("class", "node")
		      .attr("rootNode",""+rootNode.uri)
		      .attr("isRoot",function(d,i){ return i==0 ;})
		      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		     
		      //.style("padding-right", "200px")
		      .on("mouseover", mo)
		      //set a delay on the mouseOut as the toolbar don't diseapear immedialty and let the user the time to reach the toolbar
		      //.on("mouseout", moutDelay)
		      .on("mouseout", mout)
		      /*.call(function(d){
		    	  var toto = "yo";
		      })*/
		      ;
		  
		  //nodeEnter.each(function(d){d.displayed = true;});
		  
		  //$(nodeEnter).delegate("mouseover", function(){mo(this);});
		  //$(nodeEnter).delegate("mouseout", function(){mout(this);});
		
		  nodeEnter.append("circle")
		      .attr("r", 1e-6)
		      .style("fill", function(d) { 
		      	return d._children ? "lightsteelblue" : "#fff"; 
		      	//return (!d.open && d.children) ? "lightsteelblue" : "#fff";
		      	})
		       //click event on the circle : open children
			    .on("click", click)
			    //.on("click", click(graphName))
		       ;
		
		  nodeEnter.append("text")
		    	.attr("x", function(d) { return textOffset; })
		        .attr("dy", ".35em")
		        .attr("text-anchor", function(d) { return "start"; })
		        .text(getLabel)
		        //.text("TEXT NODE TODO")
		        .style("fill-opacity", 1e-6)
		        //event management
		        .on("click", targetLinkClick)
		        .on("dblclick", doubleClick)
		        //.call(dragdrop)
		        //.call(testCall)
		        
		        //
		        ;
		
		  // Transition nodes to their new position.
		  var nodeUpdate = node.transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		      //after the endUpdateGraphLink(); of the first transition, a second one for link
		      //.transition()
		      //.duration(duration)
		      //.
		      ;
		
		  nodeUpdate.select("circle")
		      .attr("r", 4.5)
		      .style("fill", function(d) { 
		      	var test = d._children;
		      	return d._children ? "lightsteelblue" : "#fff"; });
		
		  nodeUpdate.select("text")
		      .style("fill-opacity", 1);
			
			//if the language has changed, update the text
			//TODO : see to set-up a change on condition
			nodeUpdate.select("text").text(getLabel);
			//nodeUpdate.select("text").text("TEXT NODE TODO");
			
		  // Transition exiting nodes to the parent's new position.
		  var nodeExit = node.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		      .remove()
		      ;
		
		  nodeExit.select("circle")
		      .attr("r", 1e-6);
		
		  nodeExit.select("text")
		      .style("fill-opacity", 1e-6);
		  
		  nodeExit.remove();
		  
		  //nodeExit.each(function(d){d.displayed = false;});
		  
		  //TODO : remove
		  //var test = tree.links(nodes);
		  
		  // Update the links…
		  var link = graphName.selectAll("path.link[rootNode=\""+rootNode.uri+"\"]")
		      .data(tree.links(nodes), function(d) { 
		    	  //return d.target.id; 
		    	  return d.source.uri+"=>"+d.target.uri;
		    	  });
		
		  // Enter any new links at the parent's previous position.
		  link.enter().insert("path", "g")
		      .attr("class", "link")
		      .attr("rootNode",""+rootNode.uri)
		      //.attr("text", function(d){ return "YO " + d.target.y;})
		      .attr("d", function(d) {
		        return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
		      })
		    //TODO : voir pour avoir une transition clean
		    .transition()
		      .duration(duration)
		     //.attr("d", diagonal)
		    .attr("d", function(d) {
		        return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
		      })
			;
		
		  // Transition links to their new position.
		  link.transition()
		      .duration(duration)
			.attr("d", function(d) {
				return diagonal([[d.source.x,d.source.y],[d.target.x,d.target.y]]);
		      })
			;
			
		
		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(duration)
		      .attr("d", function(d) {
		    	  return diagonal([[source.x,source.y],[d.target.x,d.target.y]]);
		      })
		      .remove();
			
		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
		  
		  //return the lastNode for use it as offset for next graphs
		  //update the offset.y with the last node
		  offset.y = nodes.last().y; 
		  return offset;
		
	}
	
	
	
	
}
