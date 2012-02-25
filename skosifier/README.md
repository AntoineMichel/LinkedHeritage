
== Call the skosifier / skosify a file ==

The endpoint accept APPLICATION_FORM_URLENCODED stuff :
curl -X POST --data-urlencode conf@mapping.json --data-urlencode file@horn1.csv http://localhost:8080/skosifier

// if endpoint is transform to MULTIPART_FORM_DATA 
//curl -X POST -H "Accept: text/turtle" -F "conf=@mapConf.json" -F "file=@data.csv" http://localhost:8080/skosifier

== Get an already skosified file ==

* for get it as turtle
curl -H "Accept: text/turtle" http://localhost:8080/skosifier?uri=http://cuture-heritage.org/thesaurus/organisationID/nameTest2

* for get it as json-ld
curl -H "Accept: application/json" http://localhost:8080/skosifier?uri=http://cuture-heritage.org/thesaurus/organisationID/nameTest2


== Get the list of existing thesaurus ==

* curl -H "Accept: application/json" http://localhost:8080/skosifier/graphlist

== get skos informations ==

curl -H "Accept: application/json" http://localhost:8080/skosifier/skosdefinition?type=all|reference|properties

== get graphLink for 2 graphs ==

* curl -H "Accept: application/json" "http://localhost:8080/skosifier/graphlink?graphOne=http://cuture-heritage.org/thesaurus/florent/testFullCSVimport&graphTwo=http://cuture-heritage.org/thesaurus/organisationID/nameTest3"

== send changes set ==

curl -X POST --data-urlencode file@horn1.csv http://localhost:8080/skosifier/changes

== Mapping ==
//TODO : review it

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
