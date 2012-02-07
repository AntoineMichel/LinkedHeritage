var SELECT = "select";
var LOCAL_ID = "localID";
var P_VALUE = "propertyValue";
var P_REF = "propertyRef";

/// TODO : use lh.skosProperties instead 
var propertyRefArray;// = [ "skos:broader", "skos:narrower", "skos:sameAs" ];
var propertyValArray;// = [ "skos:concept", "skos:scopeNote", "skos:definition" ];

//initialisation of properties Arrays
function initPropArrays(){
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
			propertyRefArray = data.values;
		}
	});
}
/// end TODO : use lh.skosProperties instead 

// functions that generate interface for subselection
// general because call with "string to function" js capabilities
function select() {
	return ""
};

function localID() {
	return "<input type='checkbox' name='cb_' value='todefine?' checked /> Unique ?"
};

function propertyValue() {
	res = "Of type: ";
	res += "<select id='pType'>";
	res += "<option value='-1'>Select one</option>";
	propertyValArray.forEach(function(v, i) {
		res += "<option value=" + v + ">" + v + "</option>";
	});
	res += "</select>";

	lang = "Language: ";
	lang += "<select id='lang'>";
	lang += "<option value='-1'>Unknown</option>"
	lang += getIsoOptions();
	lang += "</select>";
	
	return res + "<br />" + lang;
}

function propertyRef() {
	res = "Of type: "
	res += "<select id='pType'>";
	res += "<option value='-1'>Select one</option>";
	propertyRefArray.forEach(function(v, i) {
		res += "<option value=" + v + ">" + v + "</option>";
	});
	res += "</select>";

	colRef = "To column:";
	// get the array with the name of header (via parameters ?)
	//ha = [ "header1", "header2", "header3" ];
	colRef += "<select id='colRefId'>";
	colRef += "<option value'-1'>Select one</option>";
	headers.forEach(function(v, i) {
		colRef += "<option value=" + i + ">" + v + "</option>";
	});
	colRef += "</select>";
	return res + "<br />" + colRef;
}

function droplists(id) {
	res = "<select name='type_" + id + "' cat='typeSelection'>"
			+ "<option value=" + SELECT + ">Not mapped</option>"
			+ "<option value=" + LOCAL_ID + ">A local ID</option>"
			+ "<option value=" + P_VALUE + ">A property</option>"
			+ "<option value=" + P_REF + ">A reference</option>" + "</select>"
			+ "</br>" + "<div id='dyn'> </div>";
	return res;
}

function getImportUI() {
	initPropArrays();
	// create the configuration line
	var mapline = "<tr id='config' class='config'>";
	headers.forEach(function(v, i) {
		mapline += "<td colid=" + i + ">"
		// + "<span style='hidden'>"+i+"</span>"
		+ "This col is :" + droplists(i) + "</td>"
		;
	});
	mapline += "</tr>";
	return mapline;
}


function addImportUI(tableID){
	$(tableID+' thead').prepend(getImportUI());
	
	// add the change event to all drop lists
	$("[cat='typeSelection']").change(function() {
		$(this).parent().children("#dyn").html(window[$(this).attr("value")]);
	});
}

