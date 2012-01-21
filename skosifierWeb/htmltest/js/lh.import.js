var SELECT = "select";
var LOCAL_ID = "localID";
var P_VALUE = "propertyValue";
var P_REF = "propertyRef";

//functions that generate interface for subselection
//general because call with "string to function" js capabilities
function select(){
	return "<p> Please select a mapping if relevant </p>"
	};
	
function localID(){
	return "<input type='checkbox' name='cb_' value='todefine?' checked /> Unique ?"
	};
	
propertyValArray = ["skos:concept","skos:scopeNote","skos:definition"];
langArray = ["fr","de","it"]; // get a real list for java.lang
function propertyValue(){
	res = "Select the value : ";
	res += "<select name='pval_' cat='pval'>";
	
	propertyValArray.forEach(function(v,i){
		res += "<option value="+v+">"+v+"</option>";
	});
	res += "</select>";
	
	lang = "Select the language : ";
	lang += "<select name='lang_'>";
	langArray.forEach(function(v,i){
		lang += "<option value="+v+">"+v+"</option>";
	});
	lang += "</select>";
	return res+"</br>"+lang;
}	

propertyRefArray = ["skos:broader","skos:narrower","skos:sameAs"];
function propertyRef(){
	res = "Select the property type : "
	res += "<select name='pval_' cat='pval'>";
	
	propertyRefArray.forEach(function(v,i){
		res += "<option value="+v+">"+v+"</option>";
	});
	res += "</select>";
	
	colRef = "Select the reference column";
	//get the array with the name of header (via parameters ?)
	ha = ["header1","header2","header3"];
	colRef += "<select name='colRef_'>";
	ha.forEach(function(v,i){
		colRef += "<option value="+i+">"+v+"</option>";
	});
	colRef += "</select>";
	return res+"</br>"+colRef;
}	

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
				output.push('<li><strong>', theFile.name, '</strong> (',
						theFile.type || 'n/a', ') - ', theFile.size,
						' bytes, last modified: ',
						// stringFile,
						// f.lastModifiedDate.toLocaleDateString(),
						'</li>');
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
		$('#demo')
				.html(
						'<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>');

		// ///////////// generation dynamique du tableau fonctionne a remettre
		// en place après
		/*
		 * $('#example').dataTable( { "aaData": fullarray, "aoColumns": header } );
		 */

		// static exemple pour tester, a remove
		$('#example').dataTable(
				{
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
		
		function droplists(id) {

			res = "<select name='type_" + i + "' cat='typeSelection'>"
					+ "<option value=" + SELECT + ">Select a value</option>"
					+ "<option value=" + LOCAL_ID + "> ID local</option>"
					+ "<option value=" + P_VALUE + "> Property</option>"
					+ "<option value=" + P_REF + "> Reference</option>"
					+ "</select>" + "</br>" + "<div id='dyn'> </div>";
			return res;
		}

		// $("#example tbody").prepend(
		$('#example').prepend(function() {
			var mapline = "<tr id='config' class='config'>";
			header.forEach(function(v, i) {
				mapline += "<td colid=" + i + ">"
				// + "<span style='hidden'>"+i+"</span>"
				+ " YO " + droplists(i) + "  " + i + "</td>"

				;
			});
			mapline += "</tr>";
			return mapline;
		}

		);
		

		
		// add the change event to all drop lists
		$("[cat='typeSelection']").change(function() {
			$(this).next("#dyn").html(window[$(this).attr("value")]);
		});

	}
	document.getElementById('list').innerHTML = '<ul>' + output.join('')
			+ '</ul>';
}
