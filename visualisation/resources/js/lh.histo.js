///********************************
//Deprecated : use lh.histo object instead
//*********************************
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
		    	h: 'http://www.culture-terminology.org/ontoHisto/'
		    	,skos: 'http://www.w3.org/2004/02/skos/core#'
		    	,rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"
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
	};
	
	//here s,p and o are already resource or literal
	//if s,p or o is an array this mean new value or deleted.
	// structure is [oldValue,newValue] : for a new value
	// [oldValue, null] : for delete a value
	//rename this as lh.history.diff(s,p,o);
	//and create a diff(trp1,trp2);
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
	
	//lh.history.crudop = function(op, objectNode,p,o,l){
	//TODO : change the name as it allow creation, remove etc...
	lh.history.update = function(objectNode,p,o,l){
		
		//****** TODO : remove this and remplace by lh.history.newTriple();
		var changeNode = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeSubject = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeProperty = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		var changeObject = $.rdf.resource("<#"+uuid.v4()+">",lh.history.ns);
		
		//var nodeSubject = $.rdf.resource("<"+objectNode["@subject"]+">",lh.history.ns);
		var nodeSubject = $.rdf.resource(objectNode.subject,lh.history.ns);
		//var nodeProperty = $.rdf.resource("skos:"+p,lh.history.ns);
		var nodeProperty = $.rdf.resource(p,lh.history.ns);
		//alert("Solve this as if the node as many same propertie this will not work");
		//var oldval = lh.sem.getPropValue(p,objectNode,l)[0].value.value;
		var oldval = objectNode.object.value;
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
		/*c = {};
		//c.crud = op;
		c.subject = objectNode["@subject"];
		c.predicate = p;
		
		//change the value of the object
		alert("see here what append");
		modif = lh.sem.setPropValue(objectNode,p,o,l);
		
		c.object = modif;
		c.date = Date.now();
		c.user ="defaultUser";
		lh.history.changes.values.push(c);
		*/
	};
	
	/*lh.history.update = function(objectNode,p,o,l){
		lh.history.crudop("u",objectNode,p,o,l);
	};
	
	lh.history.create = function(objectNode,p,o,l){
		lh.history.crudop("c",objectNode,p,o,l);
	};*/
	
	//TODO : add a date parameter for revert before a date
	lh.history.revertChanges = function(){
		lh.history.changes.values.reverse().forEach(function(c){
			//TODO : get setpropValue get directly the c.object[0] ==> create a js litteral(factory)
			lh.sem.setPropValue(node,c.predicate,c.object[0]["@literal"],c.object[0]["@language"]);
			test = "";
		});
	};
	
	//TODO : create a multiple local changes ? ie return an id
	//TODO : check if the graph is modifiable. 
	lh.history.initLocalChange = function(graph){
		//remove the existing change object
		lh.history.rdfChanges = {};
		lh.history.createLocalChange(graph);
	};
	
	lh.history.createLocalChange = function(graph){
		lh.history.ns.base = graph.history.hroot.toString();
		lh.history.hRootNode = $.rdf.resource("<"+graph.history.hroot+">");
		
		lh.history.rdfChanges = $.rdf.databank([],lh.history.ns);
		
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"a","h:history",lh.history.ns));
		lh.history.rdfChanges.add($.rdf.triple(lh.history.hRootNode,"h:historyOf","<"+graph.graphURI+">",lh.history.ns));
		
	};
	
	//TODO : move to an utility class or better overload the rdf.fn
	lh.contains = function (databank, triple) {
		var match = $.rdf({databank : databank}, lh.history.ns)
			.where(triple.subject+" "+triple.property+" "+" "+triple.object);
		return !(match.length == 0);
	};
	
	lh.history.apply = function(rdfChanges,rdfDatabank){
		//first, get all changes and sort them
		var changes = $.rdf({databank : rdfChanges}, lh.history.ns)
			.where("?s rdf:type h:change")
			.where("?s h:date ?date")
			.where("?s h:subject ?smodif")
			.where("?smodif h:element ?os") //os = old subject
			.optional("?smodif h:newValue ?ns") // ns = new subject
			.where("?smodif h:property ?pmodif")
			
			.where("?pmodif h:element ?op") //op = old property
			.optional("?pmodif h:newValue ?np") //np = new property
			.where("?pmodif h:object ?omodif")
			
			.where("?omodif h:element ?oo") // oo= old object
			.optional("?omodif h:newValue ?no") // no = new object
			.group(['s','smodif'])
			;
		
		//sort changes by date
		changes.sort(function(a, b) {  
		    return a - b;  
		});
		
		changes.each(function(i,c){
			var os,ns,op,np,oo,no;
			os = c.os;
			c.ns ? ns = c.ns[0] : ns = c.os;
			
			op = c.op;
			c.np ? np = c.np[0] : np = c.op;
			
			oo = c.oo;
			c.no ? no = c.no[0] : no = c.oo;
			var oldTrp = $.rdf.triple(os,op,oo,lh.history.ns);
			
			//remove old node
			//have to check if such a node exist because if any create a bug, ie remove random other nodes
			//TODO : submit a bug about this random remove ?
			if (lh.contains(rdfDatabank,oldTrp)){
				$.rdf({databank : rdfDatabank},lh.history.ns)
				.remove(oldTrp);
			}
			
			//workaround to allow the triple to be added to the databank. Really strange, seems to be associated to low level string function.
			//need to add a string part for allowing the literal to be good.
			//any micro change (ex: create a triple, add a variable) to this code will break things. 
			//TODO : test on another browser
			//TODO : test if it comes from the $(this).val() (before call to history update)
			//TODO : create a test case were the rdf to be added is getted from another graph, and submit it to project
			//for the test case : count the number of elements in 
			// var cdosd = $.rdf({databank : rdfDatabank}).prefix("skos","http://www.w3.org/2004/02/skos/core#").where(os + " skos:prefLabel ?o");
			var str = no.value.toString()+"bug";
			var t = $.rdf.literal((no.value.toString()+"bug").substring(0, str.length - 3), {lang: no.lang});
			$.rdf({databank : rdfDatabank})
				.add(ns + " " + np + " " +t);
		});
		
	};
	
})();