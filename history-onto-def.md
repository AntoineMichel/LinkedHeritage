
# Description of classes and properties 

## Class : History 

Description :
Set a reference to the graph where this history apply and contains the list of changes

Applicables properties :
* historyOf : reference to the graph, unique, required
* change : reference to change(s) apply to this graph, multiple, optionnal

## Class : Change

Description : 
Describe a change in the graph

Applicables properties : 
* from : define the graph version where this change is apply, unique, required
* to : define the graph version stated after this change (or a set of changes) apply, unique, optionnal
* Date : date when the change was created, unique, required
* user : identifier of the user make the change, it's better if this id is unique in the reference system, unique, optional
* subject : reference to the modification object on the graph, unique required

## Class : subject

Description :
Describe the subject of the source triple and the (optional) change apply to this subject.

Applicables properties :
* element : reference to the subject in the graph before application of the change (equivalent to the "-" in a classical diff), ??unique??, optional if "newValue"
* newValue : new value affected to the item after the change, unique, optional if "element"
* property : reference to the property change of the triple, unique, required

## Class : property

Description : 
Describe the property of the source triple and the (optional) change apply to this property.

Applicable properties :
* element : same as "element" in "subject" class
* newValue : same as "newValue" in "subject" class
* object : reference to the object change of the triple, unique, required

## Class : object

Description :
Describe the object of the source triple and the (optional) change apply to this object.

Applicable properties :
* element : same as "element" in "subject" class
* newValue : same as "newValue" in "subject" class


# Special property 

## delete

Description : 
Allow to describe when an atom (s,p or o) is remove during the change.

Apply to property : "newValue"
In class : subject, property, object

# Business rules

## Create a new triple

Creating a new triple is equivalent to create at least a new atom (s,p or o).
When creating a new atom only the "NewValue" property is required.
exemple :
uri : 1111
	a subject . || a property . || a object .
	newValue [reference or object]
 	[property reference or object reference or nothing]

## Change a triple

Creating a new triple is equivalent to change at least a value of one atom (s,p or o).
When changing and atom the "element" and "NewValue" properties are required.
exemple :
uri : 1111
	a subject . || a property . || a object .
	element [reference or object]
	newValue [reference or object]
 	[property reference or object reference or nothing]


## Delete a triple

Deleting a triple is equivalent to delete at least an atom (s,p or o).
When deleting a new atom the "element" and "NewValue" properties are required.
The "NewValue" property need to use a reference to the "delete" property.
exemple :
uri : 1111
	a subject . || a property . || a object .
	element [reference or object]
	newValue h:delete .
 	[property reference or object reference or nothing]


# Design decision

## Atomic diff / diff of one element

In an unix diff command, changes are identify for each line. The line is the smaller denominator that is take in account for a good diff and patch process.
In an RDF graph, this smaller denominator is the triple.
But, in RDF changing a triple mean changing only one of this atom (s,p or o). 
In fact, ontoHisto have to keep track of :
- the triple that change
- witch atom in the triple change.
So, the matter is to identify the triple that change, and take a track of what's change in this triple.
To fullfil this objectives :
Classes : "subject", "property", "object" help to keep track of each atom (s,p and o) of each triple.
Property "element" identify the value of each atom in the original graph, and then to get the good triple
Property "newValue" identify the newValue of the atom (or atoms) that change(s).


## Global diff

Previous paragraph show the modelisation of only one element.
The goal of a diff is to keep track of all modifications done on a graph.
To fullfil this objective : 
Class "history" : keep the reference to the changed graph and contains the list of changes apply to this graph
Class "Change" : describe metadata of an atomic change, ie original graph version, target graph version, date of the change, user that done the change and reference to the subject of the triple that change.

# Exemples

* You can find ontoHisto files here : //////////////
