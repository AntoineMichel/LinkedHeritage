
Change object : 
- if with a from propertie but not a to propertie : current modifications, not take in account for a new version
- if with a from and a to : différence beetween the two versions

diff object :
- if no "old-value" define : equiv to a creation of the element
- if no "new-value" define : equiv to a delection of the element
==> So the "crud" propertie is really usefull ? as couples :
* !old-value && new-value : equiv to create (c)
* old-value && new-value : equiv to update (u)
* old-value && !new-value : equiv to delete (d)

Why a "diff" object : 
- this allow to define, depending on the need to have "atomic" changes (with just one diff) or "changeset" (with multiple diff)

uri:123
	a history .
	history-of urn:graph .
	change urn:change-id-1 .
	change urn:change-id-2 .
	change urn:change-id-3 .

change-id-1
	a change
	from versionNumber .
	crud c|u|d . // removed ??//
	subject urn:graph-subject-id . //can't be null, if not exist in the graph, parser have to create it//
	date date-value .
	user user-id .
	comment "create a new subject"
	diff urn:diff-change-id-1-1 .

urn:diff-change-id-1-1 .
	a diff .
	element subject|propertie|object
	new-value urn:1234|skos:prefLabel|objectValue
	old-value urn:0000|skos:altLabel|oldObjectValue


===== TEST  :

0) create the empty graph
curl -H "Accept: application/json" "http://localhost:8080/skosifier/graphlink?graphOne=http://cuture-heritage.org/thesaurus/organisationID/nameTest2&graphTwo=http://cuture-heritage.org/thesaurus/organisationID/nameTest6"

0') copy the graph id in test files in history-of node

1) add one concept with 2 closeMatch && one another concept with broaderMatch
curl -X POST --data-urlencode change@add-a-close-match-triple.xml http://localhost:8080/skosifer/changes

2) modify a close match object && change a property (from broaderMatch to a narrower)
curl -X POST --data-urlencode change@change-a-close-match-triple.xml http://localhost:8080/skosifer/changes

<<<<<<< HEAD
<<<<<<< HEAD
3) delete *one* close match property && delete a concept
=======
3) delete a close match property && delete a concept
>>>>>>> a working version of the change ontology with test (have to be automated)
=======
3) delete *one* close match property && delete a concept
>>>>>>> little wording
curl -X POST --data-urlencode change@delete-a-close-match-triple.xml http://localhost:8080/skosifer/changes
