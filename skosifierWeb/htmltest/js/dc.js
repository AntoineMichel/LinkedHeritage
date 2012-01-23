
function addContent(c){
	result = "";
	alert("ADC "+JSON.stringify(c));
	result += c.forEach(function(d){
		alert(typeof d);
		if(typeof d === "object"){
			process(d,null);
		}
		//addContent(d)
		});
	return result;
}

function process(jt ,value){
	//get attributes
	attr ="";
	jt.nAttr != null ? jt.nAttr.forEach(function(d){attr+=" "+d}) : attr += "";
	
	var result;
	value != null ? attr +=" name="+value : "";
	result = "<"+jt.nName+attr;
	if(jt.nContent != null){
		if(typeof jt.nContent === "string"){
			result +=">";
			result += jt.nContent;
			result += "</"+jt.nName+" >";
		}
		else if(typeof jt.nContent === "array"){
			jt.nContent.forEach(function(d){
				if(typeof d === "object"){
					result += process(d);
				}
				if(typeof d === "array"){
					alert(d.size);
					//if d.size =2
					//d[0] =+> value
					//d[1] =+> if(startwith # jt.nContent= eval(d[1]), else value
				}
			});
		}
	}
	else{ result += " />";}
	
	
	return result;
}

function field(value, type){
	//alert(type);
	var jt = null;
	
	if(type != null && type != ""){
		alert(type);
		try{
			jt= JSON.parse(type);
		}catch(err){
			alert("Error in dc.js"+err);
		};
		
		return process(jt,value);
		/*switch(jt.type){
		case "textarea":
			return "<textarea"+attr+" name="+value+" />";
		case "option":
			//gestion des options
			//default
			//if # or if ===array si array if size=2 or size=1
			alert("option");
			return "<h2> YPPP</h2>";
		default :
			//TODO : an error message
		}*/
	}else{
		return "<input type='text' name="+value+" />";
	};
	
}

function buildForm(adress, id){
	$.ajax({
		  url: adress,
		  context: $(id),
		  dataType : "xml",
		  success: function(xml){
			//TODO : use a more clean form definition that in table
			var f = "<table>";
			//alert($(xml).childNode[1]);
			$(xml).find("rdf\\:Property").each(function(i,d){
				f += "<tr>";
				f += "<td>"+$(d).find("rdfs\\:label").text()+": </td>";
				//alert($(d).find("rdfs\\:label").text());
				//f += "<td>"+"<input type='text' name="+d.attributes[0].nodeValue+" /> </td>";
				f += "<td>"+field(d.attributes[0].nodeValue , $(d).find("lhf\\:params").text())+"</td>";
				
				//get comment and note
				f += "<td>"+$(d).find("rdfs\\:comment").text()+"<br />"+$(d).find("dcterms\\:description").text()+"</td>"
				
				f += "</tr>";
				
				});
			/*$(xml).select("rdf\\:Property").each(function(i,d){
				f += "<tr>";
				//alert($(d).html);
		    	f += "<td>"+$(d).select("rdfs:label").text()+"</td>";
		    	
		    	f += "</tr>";
		    });*/
		    f += "</table>";
		    $(this).html(f);
		  }
		});
}