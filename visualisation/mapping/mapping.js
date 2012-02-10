(function(){
	lh.utils = {};
	lh.utils.langSelector = function(selectNode, langArray, changeFunc){
		$(selectNode).html(function(){
			res = "";
			langArray.forEach(function(v, i) {
				res += "<option value=" + v + ">" + v + "</option>";
			});
			return res;
		});
		$(selectNode).change(changeFunc);
	};
	
	/////semantic part
	lh.sem = {};
	//TODO : use better nammings for properties
	//TODO : remove duplication in mapping .js for getValues and getPropValues
	function getValues(propObj,prop){
		if (propObj){
			return propObj[prop];
		}
		else return undefined;
	}
	
	//TODO : see how to deal with null propObj ?
	function setValues(propObj,prop,value,lang){
		if (propObj){
			propObj[prop] = value;
			if(lang){
				propObj["@language"] = lang;
			}
			
		}
		return propObj;
		//else : null object... fire an error ?
		
	}
	
	lh.sem.getPropValue = function(prop, d, lang){
		if(!lang) lang = d.ingraph.curLang;
		result = d[prop];
		if (d[prop] instanceof Array){
			result = d[prop].filter(function(p){ return p["@language"] == lang;})[0];
		}
		return getValues(result,"@literal");
	};
	
	//return an array with [{oldvalueOject},{newValueObject}]
	//this object are clone of the originals ones
	lh.sem.setPropValue = function(d,p,label,lang){
		/*if (d[p] == null){
            return d;
		}
		result = d[p];*/
		if (d[p] instanceof Array){
			result = d[p].filter(function(z){ return z["@language"] == lang;})[0];
			if(!result){ //if result is null
				result = {};
				d[p].push(result);
			}
		}
		else {
			result = d[p];
			if(!result){
				result = {};
				d[p] = result;
			}}
		
		//if (d[p])
		//cloning stuff... Do shallow, here, see if deep clone needed
		//http://stackoverflow.com/a/122704
		var original = jQuery.extend({}, result);
		modif = setValues(result,"@literal",label,lang);
		return [original, jQuery.extend({}, modif)];
	}
	
})();

function initGraphDisplay(){
	var m = [50, 120, 50, 120],
	    w = 1280 - m[1] - m[3],
	    h = 800 - m[0] - m[2],
	    tby = 0,
	    i = 0,
	    duration = 500
	    ;
	
	var tree = d3.layout.tree()
	    .size([h, w])	
		;
	
	var diagonal = d3.svg.line()
			.interpolate("step-before")
			;
	
	var svgZone = d3.select("#chart").append("svg")
			.attr("width", w + m[1] + m[3])
			.attr("height", h + m[0] + m[2]);
	
	var graphOne = svgZone.append("g").attr("transform", "translate(" + m[3] + "," + m[0] + ")")
		.attr("id", "graphOne");
	var graphTwo;
	initGraphTwo();
	
	function initGraphTwo(){
		graphTwo = svgZone.append("g").attr("transform", "translate(" + w/2 + "," + m[0] + ")")
		.attr("id", "graphTwo");	
	}
	
	/** tool bar related code */
	var toolBar = svgZone.append("g").attr("transform", "translate(" + m[3] + "," + tby + ")")
					.attr("id", "toolBar");
	
	function initToolBar(){
		
		//TODO : build a data structure with elements :
		/*
		 * image
		 * click : function();
		 * 
		 * and then pass this structure to the builder (that position elements automaticaly) and bind function
		 */
		
		toolBar.append("image")
			.attr("x",0).attr("y",0)
			
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 30 30")
			.attr("width",30).attr("height",30)
			.attr("xlink:href","img/bridge-stone-new.png")
			.on("click", function(){alert("toto")});
			;
	}
	
	initToolBar();
	
	
	/*** init display of the first graph ***/
	var graphOneURL = getURLargs()["uri"];

	getGraph(graphOne,graphOneURL);
	
	//load graph list
	$.ajax({
		url : "http://localhost:8080/skosifier/graphlist/",
		dataType : "json",
		success: function(data){
			opt = "";
			//default value
			opt += "<option value='-1'>Choose the graph you want to map to.</option>";
			data.graphUri.forEach(function (d){
				opt += "<option value="+d+">"+d+"</option>";
			});
			$("#graphChoice").html(opt);
			$("#graphChoice").change(function(){
				val = $(this).attr("value");
				if(val == '-1'){
					graphTwo.remove();
					initGraphTwo();
				}else {
					getGraph(graphTwo, val);
				}
			});
		}
	});
	
	
	
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
		res = getPropValue("prefLabel",d);
		if (!res) res = "---racine---";
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
	  update(d.ingraph, d);
	}
	
	//jqueryui dialog box
	$( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Save changes": function() {
				
				n = lh.modify.save();
				update(n.ingraph,n);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				
				n = lh.modify.cancel();
				update(n.ingraph,n);
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			
		}
	});
	
	
	function doubleClick(d) {
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
	
	/*********** Drag and drop ****/
	
	//////////// mouseOver Related code
	var target; 
	
	function mo(d,i){
		target = d;
		d3.select("#mover").text(getLabel(d));
		d3.select(this).attr("fill", "orange"); 
		
		//var sel1 = d3.select(this).node().parentElement();
		var tt = this;
		//alert(this.getComputedTextLength());
		//var sel1 = ;
		//var sel2 = d3.select(this)[0][0].parentNode;
		///test for add bridge function
		//d3.select(this)
		//insert("g","text")
		d3.select(this.parentNode).append("g")
		//sel1.append("g")
			.attr("transform", "translate(" + (this.getComputedTextLength() + 10) + "," + (-25) + ")")
			.attr("id", "localToolBar")
			.append("image")
				.attr("x",0).attr("y",0)
				.attr("preserveAspectRatio","xMidYMid meet")
				.attr("viewBox","0 0 30 30")
				.attr("width",30).attr("height",30)
				.attr("xlink:href","img/bridge-stone-new.png")
				.on("click", function(){alert("toto")})
			;
	}
	
	function mout(d,i){
		target = d;
		d3.select("#mover").text(getLabel(d));
		d3.select(this).attr("fill","");
		
		d3.select(this.parentNode).select("g #localToolBar").remove();
		
	}
	////////////end mouseOver Related code
	
	function dragstart(d,i){
		txt = "start Drag :" + getLabel(d);
		//d3.select("#debug").text(txt);
		//onDragAndDrop = true;
	};
	function dragmove(d,i){
		pnode = d3.select(this.parentNode);
		
		d.x += d3.event.x+10;
		d.y += d3.event.y+10;
		
		d3.select(this.parentNode).attr("transform", "translate(" + d.x + "," + d.y + ")");
	};
	
	function dragend(d,i){
		
		txt = "drag END :" + getLabel(d) + ":::" + getLabel(target);
		d3.select("#dragend").text(txt);
		
		
		//if the drag move to the same place, or to a different graph, do nothing
		if( (target != d) && (d.ingraph == target.ingraph)){
		
		//remove this object from his parent's children list
		childrenOfParent = d.parent.children;
		childrenOfParent.splice(childrenOfParent.indexOf(d), 1);
		
		//put this object as children of the target (his new parent)
		childrenOfTarget = collapsed(target) ? target._children : target.children;
		//if this is the first children of the target
		if(childrenOfTarget == null){
			//collapsed is false for sure (no children), so we create a new target.children
			target.children = new Array();
			childrenOfTarget = target.children;
		}
		childrenOfTarget.push(d);
		update(target.ingraph, target);
		}
		//if not respect contraint, redraw
		else{ update(d.ingraph,d);}
		//onDragAndDrop = false;
		
	};
	
	var dragdrop = d3.behavior.drag()
					.on("dragstart", dragstart)
				    .on("drag", dragmove)
				    .on("dragend", dragend);
	
	/*********** End drag and drop ****/
	
	
	/**** get datas ****/
	
	function getGraph(graphName, graphURI){
		$.ajax({
			url : "http://localhost:8080/skosifier?uri="+graphURI,
			//accepts : "application/json",
			headers : {"Accept":"application/json"},
			dataType : "json",
			success: function(data){
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
					update(graphName,graphName.root);
				});
	}
	
	/*** end language management ***/
	
	function displayGraph(graphName, json){
		
		//TODO : retrive lang information from the json
		graphName.langArray = ["fr","nl","en"];
		graphName.curLang = graphName.langArray[0];
		graphLangSelector(graphName);
		
		//get the root of all ld subjects... .@Context is about NS infos
	     rootf = json["@subject"];
		
		//select just certains elements in the json.
		//be care full this seems to not apply for ie now (see here : http://stackoverflow.com/a/2722213)
		// method use : http://stackoverflow.com/a/1694961 
		// TODO : have a look at json path :
		// here : http://code.google.com/p/jsonpath/
		// and here : http://goessner.net/articles/JsonPath/
		
		objWithBroader = rootf.filter(function (p){return p.broader != null;});
		objParent = rootf.filter(function(p){return p.broader == null;});
		///
		
		
		function getChildren(d){
			var globD = d;
			d.children = objWithBroader.filter(function(p){ return p.broader == globD["@subject"];});
			//set to null for saying "no children" and get the circle white
			d.children.length == 0 ? d.children = null : d.children.forEach(getChildren); 
			//get a reference in each node to the graph
			d.ingraph = graphName;
		}
		
	  graphName.root = json;
	  
	  graphName.root.ingraph = graphName;
	  
	  graphName.root.children = objParent;
	  //build the tree :
	  graphName.root.children.forEach(getChildren);
	  //root.x0 = h / 2;
	  graphName.root.x0 = 10;
	  graphName.root.y0 = 0;
	
	  function collapse(d) {
	    if (d.children) {
	      d._children = d.children;
	      d._children.forEach(collapse);
	      d.children = null;
	    }
	  }
	
	  graphName.root.children.forEach(collapse);
	  update(graphName, graphName.root);
	
	}
	
	
	function update(graphName, source) {
	
	  // Compute the new tree layout.
	  //var nodes = tree.nodes(root).reverse();
	  //TODO remplace root by source here
	  //var nodes = tree.nodes(root);
	  var nodes = tree.nodes(graphName.root);
		
	  debugTest = 1;
	  // Normalize for fixed-depth.
	  //nodes.forEach(function(d) { d.y = d.depth * 180; });
	  nodes.forEach(function(d , i) { d.x = d.depth * 20 ; d.y = i * 15 ;});
	
	  // Update the nodes…
	  var node = graphName.selectAll("g.node")
	      .data(nodes, function(d) { return d.id || (d.id = ++i); });
	
	  // Enter any new nodes at the parent's previous position.
	  var nodeEnter = node.enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	      //.on("click", click)
	      ;
	
	  nodeEnter.append("circle")
	      .attr("r", 1e-6)
	      .style("fill", function(d) { 
	      	var test = d._children;
	      	return d._children ? "lightsteelblue" : "#fff"; })
	       //click event on the circle : open children
		    .on("click", click)
		    //.on("click", click(graphName))
	       ;
	
	  nodeEnter.append("text")
	    	.attr("x", function(d) { return 10; })
	        .attr("dy", ".35em")
	        .attr("text-anchor", function(d) { return "start"; })
	        .text(getLabel)
	        .style("fill-opacity", 1e-6)
	        .call(dragdrop)
	        .on("dblclick", doubleClick)
	        .on("mouseover", mo)
	        .on("mouseout", mout);
	        ;
	
	  // Transition nodes to their new position.
	  var nodeUpdate = node.transition()
	      .duration(duration)
	      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
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
		/*
		if(changeLang){
			nodeUpdate.select("text").text(getLabel);
			changeLang = false;
		}*/
		
	  // Transition exiting nodes to the parent's new position.
	  var nodeExit = node.exit().transition()
	      .duration(duration)
	      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	      .remove();
	
	  nodeExit.select("circle")
	      .attr("r", 1e-6);
	
	  nodeExit.select("text")
	      .style("fill-opacity", 1e-6);
	
	  // Update the links…
	  var link = graphName.selectAll("path.link")
	      .data(tree.links(nodes), function(d) { return d.target.id; });
	
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g")
	      .attr("class", "link")
	      .attr("text", function(d){ return "YO " + d.target.y;})
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
	}
	
}