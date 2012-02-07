
(function(){
	
	var propertyValArray
		,propertyRefArray;
	
	//TODO : remove it from object initialisation, but jquery ajax cross-domain don't accept synchronous request 
	skosOnto = function(){
		initPropArrays();
	};
	
	//just for init the object and get all async call finished
	skosOnto.init = function(){};
	
	//TODO : create error messages when null, wait a wile more
	skosOnto.getReferences = function(){
	if (propertyRefArray == null){
		//TODO : error message
		initPropArrays();}
		return propertyRefArray;
	};

	skosOnto.getValues = function(){
		if (propertyValArray == null){
			//TODO : error message
			initPropArrays();}
		return propertyValArray;
	};

	
	initPropArrays = function(){
		
		$.ajax({
			url : "http://localhost:8080/skosifier/skosdefinition?type=properties",
			type : "GET",
			dataType : "json",
			success: function(data){
				propertyValArray = data.values;
			}
		});

		$.ajax({
			url : "http://localhost:8080/skosifier/skosdefinition?type=references",
			type : "GET",
			dataType : "json",
			success: function(data){
				skosOnto.propertyRefArray = data.values;
			}
		});
}

})();
var sko = new skosOnto();