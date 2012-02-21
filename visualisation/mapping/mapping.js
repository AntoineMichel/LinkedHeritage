(function(){
	
	//add the last() utility to array
	if(!Array.prototype.last) {
	    Array.prototype.last = function() {
	        return this[this.length - 1];
	    }
	}

	
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
	}
	
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
	}
	
	var processID;
	//
	lh.utils.startProcess = function(interval){
		processID = setInterval(
				function(){lh.utils.processEvent();},
				interval);
	}
	//TODO add a lh.utils.stopProcess
	
	
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

//var tOut = Array();
var ltb ;
var tout; // timeout variable

//TODO : make and object for this
function initGraphDisplay(){
	var m = [10, 120, 50, 120],
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
	var toolBar = toolBarZone.append("g").attr("transform", "translate(" + m[3] + "," + tby + ")")
					.attr("id", "toolBar");
	
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
	var graphLink = svgZone.append("g")
		.attr("id", "graphLink");
	
	
	
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
		res = lh.sem.getPropValue("prefLabel",d);
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
	var onltb = false;
	var onDragAndDrop = false;
	
	function moltb(d){
		d3.select("#mover").text("MO TOOL BAR");
		clearTimeout(tout);
		onltb = true;
	}
	
	function moutltb(d){
		onltb = false;
	}
	
	var onCreateLink = false;
	var nodeLinkObj = null;
	
	function linkMouseMove(){
		//allow click event to passthrow the link
		var offset = 3;
		//log = "<p> create mouse mouve "+ Date.now() +"</p>";
		//ev = d3.event;
		mp = d3.svg.mouse(graphLink.node());
		//log += "<p>"+ mp[0] + "  " + mp[1] + "</p>";
		$("#info-box #infoZone").html(log);
		//get the starting point coord
		var pt = nodeLinkObj.node().getPointAtLength(0);
		nodeLinkObj.attr("d", function(r) {
			return diagonal([[pt.x,pt.y],[mp[0]+offset,mp[1]+offset]]);
		});
		
	}
	
	//TODO : remove this ??
	function createLinkClick(d){
		nl = {};
		//nl.source = d;
		//first parent is the localToolBar, second is the g.node
		nl.source = this.parentNode.parentNode;
		mapLinks.push(nl);
		//alert("new link");
		
		$( "#info-box" ).dialog( "open" );
		log = "<p> create link </p>";
		$("#info-box #infoZone").html(log);
		
		//create an svg point 
		var pt = (nl.source.ownerSVGElement || nl.source).createSVGPoint();
		
		//TODO : use js native selector ? better perf than the D3 one ?
		pt.x = d3.select(nl.source).select("text").node().getComputedTextLength() + textOffset;
		pt.y = 0;
		
		pt = pt.matrixTransform(nl.source.getCTM());
		
		nodeLinkObj = graphLink.append("path")
			.attr("class", "tempLink")
			.attr("d", function(r) {
	    	  //return diagonal([[60, 60],[pt.x,pt.y]]);
				return diagonal([[pt.x,pt.y],[pt.x,pt.y]]);
	      });
		
		d3.select(nl.source.ownerSVGElement).on("mousemove",linkMouseMove);
		onCreateLink = true;
	}
	
	function targetLinkClick(d){
		if (nodeLinkObj){
			
			onCreateLink = false;
			nl = mapLinks.pop();
			
			//the event is on the text, we want the parent g node
			nl.target = this.parentElement;
			mapLinks.push(nl);
			
			d3.select(nl.source.ownerSVGElement).on("mousemove",null);
			
			UpdateGraphLink();
			
			//remove the nodeLinkObj from the dom
			nodeLinkObj.remove();
			nodeLinkObj = null;
		}
		
		
		
	}
	
	
	var curPnode;
	//var ltb ;
	//var tout; // timeout variable
	 
	function buildToolBar(parentNode){
		
		var txtNode =  d3.select(parentNode).select("text");
		txtNode.attr("fill", "orange");
		
		ltbnode = d3.select(parentNode).append("g");
		
		ltbnode
			.attr("transform", "translate(" + (txtNode.node().getComputedTextLength() + 10) + "," + (-25) + ")")
			.attr("id", "localToolBar")
			.append("image")
				.attr("x",0).attr("y",0)
				.attr("preserveAspectRatio","xMidYMid meet")
				.attr("viewBox","0 0 30 30")
				.attr("width",30).attr("height",30)
				.attr("xlink:href","img/bridge-stone-new.png")
				.on("click", createLinkClick)
				.on("mouseover",moltb)
				.on("mouseout",moutltb)
			;
		
		ltbnode
		.attr("transform", "translate(" + (txtNode.node().getComputedTextLength() + 10) + "," + (-25) + ")")
		.attr("id", "localToolBar")
		.append("image")
			.attr("transform", "translate(30,0)")
			.attr("x",0).attr("y",0)
			.attr("preserveAspectRatio","xMidYMid meet")
			.attr("viewBox","0 0 30 30")
			.attr("width",30).attr("height",30)
			.attr("xlink:href","img/redo_32x32.png")
			//TODO : put the dragdrop event on the text, but as D3 V2.7.4 there is a conflict with click event
			// start with this and do a bug example : http://bl.ocks.org/1378144
			.call(dragdrop)
		;
		return ltbnode.node();
	}
		
	
	//TODO : rename to : attach
	function mo(d,i){
		
		if (!onDragAndDrop){
			yo = "";
			if (ltb){
				rmTB(ltb);
				clearTimeout(tout);
			}
			ltb = buildToolBar(this);
		}
		else {
			target = d
			var txtNode =  d3.select(this).select("text");
			txtNode.attr("fill", "red");
		};
		
		/*if(curPnode){rmTB(curPnode)};
		curPnode = this;
		//if there is no already a localtoolbar, add one
		if (d3.select(this).select("g #localToolBar").empty()){
			target = d;
			d3.select("#mover").text(getLabel(d));
			//TODO : ltb(this)
			ltb = buildToolBar(this);
		}*/
		
		//reatach mo;
		//d3.select(this).on("mouseover",mo);
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
		if(!onDragAndDrop){
			node = this;
			//lh.utils.addTevent(rmTB,this, 5000);
			//ltb.remove();
			tout = setTimeout( function(){rmTB(node);}, 1000);
		}
		else{
			d3.select(this).select("text").attr("fill", null);
		}
		
		
	}
	//TODO : change references for new mo et mout
	/*function mo(d,i){
		
		//if there is no already a localtoolbar, add one
		if (d3.select(this).select("g #localToolBar").empty()){
			target = d;
			d3.select("#mover").text(getLabel(d));
			var txtNode =  d3.select(this).select("text");
			txtNode.attr("fill", "orange");
			
			d3.select(this).append("g")
				.attr("transform", "translate(" + (txtNode.node().getComputedTextLength() + 10) + "," + (-25) + ")")
				.attr("id", "localToolBar")
				.append("image")
					.attr("x",0).attr("y",0)
					.attr("preserveAspectRatio","xMidYMid meet")
					.attr("viewBox","0 0 30 30")
					.attr("width",30).attr("height",30)
					.attr("xlink:href","img/bridge-stone-new.png")
					.on("click", function(){alert("toto")})
					.on("mouseover",moltb)
					.on("mouseout",moutltb)
				;
		}
		
		//reatach mo;
		//d3.select(this).on("mouseover",mo);
	}*/
		
	
	
	
	//lh.utils.startProcess(200);
	
//	function rmTB(){
//		if(onltb) return false;
//		d3.select(this).select("text").attr("fill", null);
//		//d3.select(this).select("g #localToolBar").remove();
//		gnode = d3.select(this).selectAll("g #localToolBar");
//		if (gnode == []){
//			alert("null");
//		}
//		gnode.remove();
//		return true;
//	}
	
//	function mout(d,i){
//		//node = this;
//		lh.utils.addTevent(rmTB,this, 5000);
//	}
	
	/*function moutDelay(d,i){
		node = this;
		setInterval(function(){mout(d,node);},3000);
		test = "yo";
	  }*/
	
	////////////end mouseOver Related code
	
	function dragstart(d,i){
		//alert("");
		//txt = "start Drag :" + getLabel(d);
		//d3.select("#debug").text(txt);
		onDragAndDrop = true;
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
		onDragAndDrop = false;
		
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
	function update(graphName, source) {
	
	  // Compute the new tree layout.
	  var nodes = tree.nodes(graphName.root);
	  
	  // Normalize for fixed-depth.
	  nodes.forEach(function(d , i) { d.x = d.depth * 20 ; d.y = i * 15 ;});
	  
	  //build a scrollbar ?
	  scrollbar(graphName,nodes);
	  
	  // Update the nodes…
	  var node = graphName.selectAll("g.node")
	      .data(nodes, function(d) { return d.id || (d.id = ++i); });
	
	  // Enter any new nodes at the parent's previous position.
	  var nodeEnter = node.enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	     
	      //.style("padding-right", "200px")
	      .on("mouseover", mo)
	      //set a delay on the mouseOut as the toolbar don't diseapear immedialty and let the user the time to reach the toolbar
	      //.on("mouseout", moutDelay)
	      .on("mouseout", mout)
	      ;
	  
	  //$(nodeEnter).delegate("mouseover", function(){mo(this);});
	  //$(nodeEnter).delegate("mouseout", function(){mout(this);});
	
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
	    	.attr("x", function(d) { return textOffset; })
	        .attr("dy", ".35em")
	        .attr("text-anchor", function(d) { return "start"; })
	        .text(getLabel)
	        .style("fill-opacity", 1e-6)
	        //event management
	        .on("click", targetLinkClick)
	        .on("dblclick", doubleClick)
	        //.call(dragdrop)
	        
	        //
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
	  
	  //TODO : remove
	  var test = tree.links(nodes);
	  
	  // Update the links…
	  var link = graphName.selectAll("path.link")
	      .data(tree.links(nodes), function(d) { return d.target.id; });
	
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g")
	      .attr("class", "link")
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
	}
	
	
	////////// Graph for link
	
	function getPointForLink(n){
		var pt = (n.ownerSVGElement || n.source).createSVGPoint();
		
		//TODO : use js native selector ? better perf than the D3 one ?
		pt.x = d3.select(n).select("text").node().getComputedTextLength() + textOffset;
		pt.y = 0;
		
		return pt.matrixTransform(n.getCTM());
	}
	
	function getCTMDiagonal(d){
		ptSource = getPointForLink(d.source);
  	  	ptTarget = getPointForLink(d.target);
  	  
  	  	//TODO : see if it's on the right or left graph
  	  	//and then choose if target point is on the start or the end of the text
  	  	return diagonal([[ptSource.x,ptSource.y],[ptTarget.x,ptTarget.y]]);
	}
	
	//l = {};
	mapLinks = new Array();
	//graphLink();
	
	function UpdateGraphLink(){
		//var graphLink = svgZone.append("g").attr("transform", "translate(" + m[3] + "," + m[0] + ")")
		//.attr("id", "graphLink");
		//mapLinks = [1,2,3,4,5,6];
		//var ll = graphLink.selectAll("path.link").remove();
		
		var link = graphLink.selectAll("path.mapLink")
	      //.data(tree.links(nodes), function(d) { return d.target.id; });
		.data(mapLinks, function(d,i){
			//alert(JSON.stringify(d));
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
		link.transition().attr("d", function(d){
			return getCTMDiagonal(d);
		})
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
	
	
}