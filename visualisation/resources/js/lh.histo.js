;(function(){
	
	lh.histo = (function(){
		
		//private static
		var graphURI; //TODO : ??put this var in public ??
		var serializer = new XMLSerializer();
		//Init the lastApply to the create date
		var lastApply = Date.now();
		
		var __ElementNode = function(rdfChanges,s,v){
			if(Object.prototype.toString.call( v ) === '[object Array]'){
				if(v[0]){
					rdfChanges.add($.rdf.triple(s,"h:element",v[0],lh.history.ns));
				}
				//if v[0] = null, it's an atom creation,
				//do nothing as only newValue property is required then.
				
				if(v[1]){
					rdfChanges.add($.rdf.triple(s,"h:newValue",v[1],lh.history.ns));
				}
				//v[1] is null so it's the delete action that is call
				else{
					rdfChanges.add($.rdf.triple(s,"h:newValue","h:delete",lh.history.ns));
				}
			}
			else{
				rdfChanges.add($.rdf.triple(s,"h:element",v,lh.history.ns));
			}
		};
		
		
		
		//constructor
		var histo = function( graphURI ) {
			//private function
			//this.getGraphHistory = function(graphName, graphURI){
			getGraphHistory = function(g){
				$.ajax({
					url : lh.server+"skosifier/history?for="+graphURI,
					headers : {"Accept":"application/rdf+xml"},
					dataType : "xml",
					success: function(data){
						//graphName.history = {};
						/*graphName.history.rdfChanges = $.rdf.databank([], lh.history.ns);
						graphName.history.rdfChanges.load(data,{});*/
						g.rdfChanges = $.rdf.databank([], lh.history.ns);
						g.rdfChanges.load(data,{});
						//get the first history node, normally unique for this graph
						//graphName.history.hroot = $.rdf({databank : graphName.history.rdfChanges})
						g.hroot = $.rdf({databank : g.rdfChanges})
							.prefix('h', 'http://www.culture-terminology.org/ontoHisto/')
							.where("?root a h:history")
							.where("?root h:historyOf <"+graphURI+">")
							[0].root.value
							;
					}
				});
			};
			
			//public var
			//TODO : see if usefull
			//graphURI = gURI;
			//TODO : take in account the graph related to this changes
			// with a changeObject like {graphNameA : [], graphName2 : []} ??
			this.changes = {};
			this.changes.values = [];
			
			//root node of the current history, need to be initialized with the databank
			//TODO : see differences / similarities beetween hRootNode and hroot...
			//this.hRootNode = {};
			this.hroot = {};
			
			//TODO : put it in private ?
			this.rdfChanges = {};
			
			
			
			// TODO : deprecate and remove.
			//TODO : create a multiple local changes ? ie return an id
			//TODO : check if the graph is modifiable. 
			this.initLocalChange = function(graph){
				//remove the existing change object
				this.rdfChanges = {};
				this.createLocalChange(graph);
			};
			
			//this.createLocalChange = function(graph){
			createLocalChange = function(h){
				/*lh.ns.base = h.hroot.toString();
				h.hRootNode = $.rdf.resource("<"+h.hroot+">");*/
				
				h.rdfChanges = $.rdf.databank([],lh.history.ns);
				
				h.rdfChanges.add($.rdf.triple(h.hroot,"a","h:history",lh.history.ns));
				h.rdfChanges.add($.rdf.triple(h.hroot,"h:historyOf","<"+graphURI+">",lh.history.ns));
				
			};
			
			
			getGraphHistory(this);
			createLocalChange(this);
			
		};
		
		//public (this instance only)
		
		// public static
	    /*histo.svg = function () {
	        return this.svgroot;
	    };*/

	    // public (shared across instances)
		histo.prototype = {
				//here s,p and o are already resource or literal
				//if s,p or o is an array this mean new value or deleted.
				// structure is [oldValue,newValue] : for a new value
				// [oldValue, null] : for delete a value
				//rename this as lh.history.diff(s,p,o);
				//and create a diff(trp1,trp2);
				//newTriple : function(s,p,o){
				diff : function(s,p,o){
					var changeNode = $.rdf.resource("<"+this.hroot+"#"+uuid.v4()+">",lh.history.ns);
					var changeSubject = $.rdf.resource("<"+this.hroot+"#"+uuid.v4()+">",lh.history.ns);
					var changeProperty = $.rdf.resource("<"+this.hroot+"#"+uuid.v4()+">",lh.history.ns);
					var changeObject = $.rdf.resource("<"+this.hroot+"#"+uuid.v4()+">",lh.history.ns);
					
					//add the change node to the history triple
					//TODO : see why here I have to add the "<"">" around for get serialisation...this is not require in createlocalChange function
					this.rdfChanges.add($.rdf.triple("<"+this.hroot+">","h:change",changeNode,lh.history.ns));
					//change triples initialisation
					this.rdfChanges.add($.rdf.triple(changeNode,"a","h:change",lh.history.ns));
					this.rdfChanges.add($.rdf.triple(changeNode,"h:from","<http://define.GRAPH.VERSION>",lh.history.ns));
					//TODO : deal with proper date format
					var dt = $.rdf.literal(Date.now());
					this.rdfChanges.add($.rdf.triple(changeNode,"h:date",dt,lh.history.ns));
					this.rdfChanges.add($.rdf.triple(changeNode,"h:user",'"default user"',lh.history.ns));
					this.rdfChanges.add($.rdf.triple(changeNode,"h:subject",changeSubject,lh.history.ns));
					
					//subject triples
					this.rdfChanges.add($.rdf.triple(changeSubject,"a","h:subject",lh.history.ns));
					//lh.history.rdfChanges.add($.rdf.triple(changeSubject,"h:element",s,lh.history.ns));
					__ElementNode(this.rdfChanges,changeSubject,s);
					this.rdfChanges.add($.rdf.triple(changeSubject,"h:property",changeProperty,lh.history.ns));
					
					//property triples
					this.rdfChanges.add($.rdf.triple(changeProperty,"a","h:property",lh.history.ns));
					//this.rdfChanges.add($.rdf.triple(changeProperty,"h:element",p,lh.history.ns));
					__ElementNode(this.rdfChanges,changeProperty,p);
					this.rdfChanges.add($.rdf.triple(changeProperty,"h:object",changeObject,lh.history.ns));
					
					//object triples
					this.rdfChanges.add($.rdf.triple(changeObject,"a","h:object",lh.history.ns));
					//this.rdfChanges.add($.rdf.triple(changeObject,"h:element",o,lh.history.ns));
					__ElementNode(this.rdfChanges,changeObject,o);
				},
				
				//TODO : add a date parameter for revert before a date
				revertChanges : function(){
					this.changes.values.reverse().forEach(function(c){
						//TODO : get setpropValue get directly the c.object[0] ==> create a js litteral(factory)
						lh.sem.setPropValue(node,c.predicate,c.object[0]["@literal"],c.object[0]["@language"]);
						test = "";
					});
				},
				
				/**
				 * Make rdfChanges on the rdfDatabank. Only locally.
				 */
				apply : function(rdfDatabank){
					//first, get all changes and sort them
					//var changes = $.rdf({databank : rdfChanges}, lh.history.ns)
					//TODO : use rdfChanges directly and not $.rdf({databank : this.rdfChanges}, lh.history.ns) ??
					var changes = $.rdf({databank : this.rdfChanges}, lh.history.ns)
						.where("?s rdf:type h:change")
						.where("?s h:date ?date")
						.where("?s h:subject ?smodif")
						.optional("?smodif h:element ?os") //os = old subject
						.optional("?smodif h:newValue ?ns") // ns = new subject
						.where("?smodif h:property ?pmodif")
						
						.optional("?pmodif h:element ?op") //op = old property
						.optional("?pmodif h:newValue ?np") //np = new property
						.where("?pmodif h:object ?omodif")
						
						.optional("?omodif h:element ?oo") // oo= old object
						.optional("?omodif h:newValue ?no") // no = new object
						
						.filter(function(i,d){
							return (d.date.value > lastApply);
						})
						
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
						
						//if one of old atom is null, creation of a new triple, no creation of old triple
						if(!(os == null ||op == null ||oo == null)){
							var oldTrp = $.rdf.triple(os,op,oo,lh.history.ns);
							
							//remove old node
							//have to check if such a node exist because if any create a bug, ie remove random other nodes
							//TODO : submit a bug about this random remove ?
							if (lh.contains(rdfDatabank,oldTrp)){
								$.rdf({databank : rdfDatabank},lh.history.ns)
								.remove(oldTrp);
							}
						}
						
						if(no.type != "uri"){
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
						}
						else{
							$.rdf({databank : rdfDatabank})
							.add(ns + " " + np + " " + no);
						}
						
						//TODO : to remove  //var dump = $.rdf({databank : this.rdfChanges}, lh.history.ns).dump({format:'application/rdf+xml'});
						var dump = rdfDatabank.dump({format:'application/rdf+xml'});
						var xmldump = serializer.serializeToString(dump);
						alert(xmldump);
						//end to remove
						
						//TODO : update the lastApply property
						// ?? update ths property to the date.now() or to the last change date value ??
						//to the last change date I think in order to take in account modifications done by others on the web...
					});
					
				},
				/**
				 * Send change to the server, don't apply them locally
				 */
				sendChanges : function(){
					//TODO : filter to send only new changes
					//TODO : update
					var dump = this.rdfChanges.dump({format:'application/rdf+xml'});
					//var serializer = new XMLSerializer();
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
				},
				/**
				 * Apply changes locally and send them to the server
				 */
				commit : function(){
					//TODO : implement this ??
				},
		};
		
		return histo;
		
	})();
	
	// Expose lh.histo to the global object	
	window.lh.histo = lh.histo;
	
})();