{
	metadata : {
		organisationName : "fullName",
		organisationID : "organisationID",
		thesaurusName : "nameTest"
	},
	//TODO : change the mapping for doing a specific case with referer (take place of "localID" and take in account metadatas, url schema and why not generation function
	/* example : 
		urlschema : ["http://mycompany.com", "organisationID"]..//data in mustbe a field in metadata (see how to deal with / and # (auto-add or strip)
	*/
	mapping :
	[{
		columnId : 0,
		type : "localID", //you can have only one column with the localID type. The last one will overrite others
		unique : true, //true is the default value
		rdfType : "skos:Concept"
	},
	{
		columnId : 1,
		type : "propertyValue",
		propType : "skos:prefLabel",
		//TODO : add a prop "class" (date, int, text, etc...)
		lang : "fr" //optionnal
	},
	{
		columnId : 4,
		type : "propertyRef", //en fait broader ID//
		refType : "skos:broader",
		columnRefId : 0 //number of the reference column column 
	}