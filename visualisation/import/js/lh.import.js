
var headers;
var stringFile;

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// files is a FileList of File objects. List some properties.
	//var output = [];
	for ( var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onloadend = (function(theFile) {
			return function(e) {
				//alert(e.target.result);
				stringFile = e.target.result;
				loadCSVTable(stringFile);
			};
		})(f);
		
		reader.readAsText(f);
		
	}	
}

function loadCSVTable(stringFile){
	
	/////////csv processing
	var tocsv = jQuery.csv("\t","\"");
	 
	fullarray = tocsv(stringFile);
	
	function makeTableHeader(a){ var res = new Array(); a.forEach(function(v){
	res.push({"sTitle": v}) }); return res; }
	
	headers = fullarray[0];
	
	//headers = makeHeader(fullarray[0]);
	
	//remove the first element of the array
	fullarray.splice(0,1);
	
	$('#csv-import')
			.html(
					'<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');

	 ///////////// generation dynamique du tableau fonctionne a remettre en place après
	$('#example').dataTable({
		"bFilter" : false,
		"bLengthChange" : false,
		"bSort" : false,
		//"bScrollInfinite" : true,
		"aaData" : fullarray,
		//"aoColumns" : headers
		"aoColumns" : makeTableHeader(headers)
	});
	 
	addImportUI("#example");

$( "#import-acc" ).accordion("activate", 1);

}

function addSubmitEvent(){
$("#submit").click(function(){
	alert("in click");
	//create json from datas in header
	var mapping = new Array();
	$("#config td").each(function() {
		var obj;
		selection = $(this).children("[cat='typeSelection']").val();
		obj = {
				"columnId" : $(this).attr("colid"),
				"type" : selection,
		};
		dynZone = $(this).children("#dyn");
		//TODO : faire la vérification de saisie au moment du clic sur submit et remonter les erreurs avant début du traitement
		switch (selection) {
			case LOCAL_ID:
				obj.unique = true; //TODO get the value from the table
				obj.rdfType = "skos:Concept"; //TODO : provide a configuration for this ?
				break;
			case P_VALUE:
				alert($(dynZone).children("#pType").html());
				pT = $(dynZone).children("#pType").val();
				pT != -1 ? obj.propType = pT : function(){alert("Select a propType");};
				vLang = $(dynZone).children("#lang").val(); 
				vLang != -1 ? obj.lang = vLang : vLang;
				break;
			case P_REF:
				pT = $(dynZone).children("#pType").val();
				pT != -1 ? obj.propType = pT : function(){alert("Select a propType");};
				colRef = $(dynZone).children("#colRefId").val();
				colRef != -1 ? obj.columnRefId = colRef : function(){alert("Select a columnReference");};
				break;
			default:
				// this is when no value is selected for mapping, do nothing
				obj = null;
			}
			
		if(obj != null){
			jmapping.mapping.push(obj);
		}
	});
	//send json to the serveur
	//load graph list
	$.ajax({
		url : "http://localhost:8080/skosifier",
		type : "POST",
		data : {"conf" : JSON.stringify(jmapping), "file" : stringFile},
		
		dataType : "xml",
		success: function(data){
			alert("result");
			
			var target = $(data).find("a").first().attr("href");  
			alert(target);
			//window.location.replace(target);
			
		}
	});
	/*result = JSON.stringify(jmapping);
	alert(result);*/
	//redirect to the visualisation file
	
});
}