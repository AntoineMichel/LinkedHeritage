
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
	crud c|u|d .
	subject urn:graph-subject-id .
	date date-value .
	user user-id .
	comment "create a new subject"
	diff urn:diff-change-id-1-1 .

urn:diff-change-id-1-1 .
	a diff .
	element subject|propertie|object
	new-value urn:1234|skos:prefLabel|objectValue
	old-value urn:0000|skos:altLabel|oldObjectValue
