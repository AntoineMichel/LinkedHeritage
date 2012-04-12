//object constructor from Jquery and http://stackoverflow.com/a/1114121
;(function(){
	
	//var graph = (function() {
	lh.graph = (function() {
		// private static
	    var nextId = 1;
	    var serializer = new XMLSerializer();
	    
		// Define a local copy of graph
		var graph = function( svgroot, rdf, rdfhistory ) {
			// private
			//TODO : extract this variables to the private static zone ?
			/*var svgroot = svgroot,
			rdf = rdf, history = rdfhistory;*/
			
	        // public (this instance only)
	        this.svg = svgroot;
	        this.rdf = rdf;
	        this.history = history;
	        
	        this.setSvg = function(svg){this.svgroot = svg;};
	        this.setRDF = function(rdf){this.rdf = rdf;};
	        this.setHistory = function(history){this.history = history;};
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
	        //svg : function(){return this.svgroot;},
	        commit : function(){
	        	var dump = lh.history.rdfChanges.dump({format:'application/rdf+xml'});
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
	        	//TODO
	        	alert("define this function");
	        },
	        update : function(){
	        	//TODO
	        	alert("define this function");
	        }
	    };

		
		
		return graph;
		
		})();
	
	// Expose jQuery to the global object
	//window.jQuery = window.$ = jQuery;	
	window.lh.graph = lh.graph;
	
})();