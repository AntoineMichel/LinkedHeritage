
function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// files is a FileList of File objects. List some properties.
	var output = [];
	for ( var i = 0, f; f = files[i]; i++) {
		var stringFile;
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				// Render thumbnail.
				// var span = document.createElement('span');
				// span.innerHTML = ['<img class="thumb" src="',
				// e.target.result,'" title="', theFile.name, '"/>'].join('');
				// document.getElementById('list').insertBefore(span, null);
				// alert("dans el output");
				stringFile = e.target.result;
				/*output.push('<li><strong>', theFile.name, '</strong> (',
						theFile.type || 'n/a', ') - ', theFile.size,
						' bytes, last modified: ',
						// stringFile,
						// f.lastModifiedDate.toLocaleDateString(),
						'</li>');
						*/
				// alert(e.target.result);
			};
		})(f);

		// Read in the image file as a data URL.
		// reader.readAsDataURL(f);
		// alert("before read");
		reader.readAsText(f);
		// alert("after read");

		// /////////csv processing
		/*
		 * var tocsv = jQuery.csv("\t","\"");
		 * 
		 * //TODO : remove : do nothing... just for the display in emacs var
		 * nothing="\"";
		 * 
		 * fullarray = tocsv(stringFile);
		 * 
		 * function makeHeader(a){ var res = new Array(); a.forEach(function(v){
		 * res.push({"sTitle": v}) }); return res; }
		 * 
		 * header = makeHeader(fullarray[0]);
		 */

		header = [ "tt", "dd", "dd", "lll", "mmm" ];

		// alert(fullarray);
		// create datatable
		$('#csv-import')
				.html(
						'<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');

		// ///////////// generation dynamique du tableau fonctionne a remettre
		// en place après
//		$('#example').dataTable({
//			"bFilter" : false,
//			"bLengthChange" : false,
//			"bSort" : false,
//			"bScrollInfinite" : true,
//			"aaData" : fullarray,
//			"aoColumns" : header
//		});
		 

		// static exemple pour tester, a remove
		$('#example').dataTable(
				{
					"bFilter": false,
					"bLengthChange" : false,
					"bSort": false,
					"bScrollInfinite": true,
					"aaData" : [
							[ "Trident", "Internet Explorer 4.0", "Win 95+", 4,
									"X" ],
							[ "Trident", "Internet Explorer 5.0", "Win 95+", 5,
									"C" ],
							[ "Trident", "Internet Explorer 5.5", "Win 95+",
									5.5, "A" ],
							[ "Trident", "Internet Explorer 6.0", "Win 98+", 6,
									"A" ],
							[ "Trident", "Internet Explorer 7.0",
									"Win XP SP2+", 7, "A" ],
							[ "Gecko", "Firefox 1.5", "Win 98+ / OSX.2+", 1.8,
									"A" ],
							[ "Gecko", "Firefox 2", "Win 98+ / OSX.2+", 1.8,
									"A" ],
							[ "Gecko", "Firefox 3", "Win 2k+ / OSX.3+", 1.9,
									"A" ],
							[ "Webkit", "Safari 1.2", "OSX.3", 125.5, "A" ],
							[ "Webkit", "Safari 1.3", "OSX.3", 312.8, "A" ],
							[ "Webkit", "Safari 2.0", "OSX.4+", 419.3, "A" ],
							[ "Webkit", "Safari 3.0", "OSX.4+", 522.1, "A" ] ],
					"aoColumns" : [ {
						"sTitle" : "Engine"
					}, {
						"sTitle" : "Browser"
					}, {
						"sTitle" : "Platform"
					}, {
						"sTitle" : "Version",
						"sClass" : "center"
					}, {
						"sTitle" : "Grade",
						"sClass" : "center",
						"fnRender" : function(obj) {
							var sReturn = obj.aData[obj.iDataColumn];
							if (sReturn == "A") {
								sReturn = "<b>A</b>";
							}
							return sReturn;
						}
					} ]
				});
		
		addImportUI("#example");
	}
	//$('#list').innerHTML = '<ul>' + output.join('')+ '</ul>';
	
	//$( "#import-acc" ).accordion(disabled: true);
	//$( "#import-acc" ).accordion("enable");
	/*$( "#import-acc" ).accordion({
		disabled : [ 2 ]
	});*/
	$( "#import-acc" ).accordion("activate", 1);
	
}

function addSubmitEvent(){
$("#submit").click(function(){
	//create json from datas in header
	var mapping = new Array();
	$("#config td").each(function() {
		var obj;
		selection = $(this).children("[cat='typeSelection']").val();
		obj = {
				"columnID" : $(this).attr("colid"),
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
			mapping.push(obj);
		}
	});
	//send json to the serveur
	result = JSON.stringify(mapping);
	alert(result);
	//redirect to the visualisation file
});
}