(function(){
	
	/////semantic part
	lh.sem = {};
	
	//RDF query utility
	//translate sujectIndex native object to and array of object {entity: , triples :}
    lh.sem.subjectIndexAsArray = function(subjectsObj){
   	 var res = [];
   	 var subjectAsArray = lh.utils.getKeys(subjectsObj);
   	 subjectAsArray.forEach(function(d){
   		 var r = {};
   		 r.entity = d;
   		 r.triples = subjectsObj[d];
   		 
   		 res.push(r);
   	 });
   	 return res;
    }
	
	
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
		/*result = d[prop];
		if (d[prop] instanceof Array){
			result = d[prop].filter(function(p){ return p["@language"] == lang;})[0];
		}
		return getValues(result,"@literal");*/
		
		//TODO : take lang in account
		return $.rdf({databank : d.ingraph.rdf.databank})
				.prefix("skos","http://www.w3.org/2004/02/skos/core#")
				.where(d.uri+" "+prop+" ?value");
		
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
			}
		}
		
		//if (d[p])
		//cloning stuff... Do shallow, here, see if deep clone needed
		//http://stackoverflow.com/a/122704
		var original = jQuery.extend({}, result);
		modif = setValues(result,"@literal",label,lang);
		return [original, jQuery.extend({}, modif)];
	};
	
})();