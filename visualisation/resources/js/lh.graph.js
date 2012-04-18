//object constructor from Jquery and http://stackoverflow.com/a/1114121
;(function(){
	
	//var graph = (function() {
	lh.graph = (function() {
		// private static
	    var nextId = 1;
	    var serializer = new XMLSerializer();
	    
	    var getRDFGraph = function(g,uri, callback){
			//get Graph data
			$.ajax({
				url : lh.server+"skosifier?uri="+uri,
				headers : {"Accept":"application/rdf+xml"},
				dataType : "xml",
				success: function(data){
					//load sem data
					/*graphName.rdf = {};
					graphName.rdf.databank = $.rdf.databank([],
		                      	{ base: 'http://www.example.org/',
	                    		namespaces: { 
	                    			skos: 'http://www.w3.org/2004/02/skos/core#'
	                    			//, map: 'http://www.culture-terminology.org/ontology/mapping#'
	                    			}
		                      	}
					);

					graphName.rdf.databank.load(data,{});*/
					/*this.rdf = $.rdf.databank([],lh.history.ns);
					this.rdf.load(data,{});*/
					g.rdf = $.rdf.databank([],lh.history.ns);
					g.rdf.load(data,{});

					callback(null,true);
					
					//return rdf;
					
					//alert("end load");
					//end loading sem data
					/*graphName.graphURI = graphURI;
					displayGraph(graphName, data);*/
					
				}
			});
	    };
	    
	    //TODO : remove the rdf and rdfhistory parameter
		var graph = function( svgroot, rdf, rdfhistory, uri ) {
			// private
			//TODO : extract this variables to the private static zone ?
			/*var svgroot = svgroot,
			rdf = rdf, history = rdfhistory;*/
			
	        // public (this instance only)
	        this.svg = svgroot;
	        this.rdf = rdf;
	        this.history = rdfhistory;
	        //TODO : don't do direct affect, as setting the uri have to call the graph and the hisotry
	        this.uri= uri;
	        
	        this.setSvg = function(svg){this.svgroot = svg;};
	        this.setRDF = function(rdf){this.rdf = rdf;};
	        this.setHistory = function(history){this.history = history;};
	        this.seturi = function(uri,f){
	        	//alert("dans le set uri");
	        	this.uri = uri;
	        	queue()
	            	//.defer(function(){return getRDFGraph(uri);})
	        		//.defer(getRDFGraph,uri)
	        		.defer(function(g,callback){
	        			getRDFGraph(g,uri,callback);
	        		},this)
	            	.defer(function(g,callback){
	            		g.history = new lh.histo(uri);
	            		callback(null,true);
	            		//return g.history;
	            		}
	            	,this)
	            .await(function(error, results) {
	            	//TODO : see to find a better use of results
	            	//alert(results);
	            	f.call();
	            	});
	        	//getRDFGraph(uri);
	        	//alert("TODO : the get history");
	        	//this.history = new lh.histo(uri);
	        	};
	        //this.get_name = function () { return rdf; };
	        /*this.set_name = function (value) {
	                if (typeof value != 'string')
	                        throw 'Name must be a string';
	                if (value.length < 2 || value.length > 20)
	                        throw 'Name must be 2-20 characters long.';
	                name = value;
	        };*/
		};
		
		// public static
	    graph.svg = function () {
	        return this.svgroot;
	    };

	    // public (shared across instances)
	    graph.prototype = {
	        announce: function () {
	                alert('Hi there! My id is ' + this.get_id() + ' and my name is "' + this.get_name() + '"!\r\n' +
	                      'The next fellow\'s id will be ' + MyClass.get_nextId() + '!');
	        },
	        add : function(trp){
	        	//TODO
	        	alert("define this function");
	        },
	        remove : function(trp){
	        	//TODO
	        	alert("define this function");
	        },
	        newTriple : function(s,p,o){
	        	//totally new triple
	        	this.history.diff([null,s],[null,p],[null,o]);
	        	//TODO : ??add apply here ??
	        },
	        //svg : function(){return this.svgroot;},
	        commit : function(){
	        	this.history.apply(this.rdf);
	        	//TODO : test to remove
	        	var dump = this.rdf.dump({format:'application/rdf+xml'});
				var xmldump = serializer.serializeToString(dump);
				alert(xmldump);
				//end test to remove
	        	//TODO : check if no error when apply
	        	//alert("TODO : Uncomment this");
	        	this.history.sendChanges();
	        	//TODO
	        	
	        },
	        update : function(){
	        	//TODO
	        	alert("define this function");
	        }
	    };

		
		
		return graph;
		
		})();
	
	// Expose lh.graph to the global object	
	window.lh.graph = lh.graph;
	
})();