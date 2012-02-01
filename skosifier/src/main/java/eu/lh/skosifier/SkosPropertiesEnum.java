package eu.lh.skosifier;

import org.apache.clerezza.rdf.core.UriRef;

public enum SkosPropertiesEnum {
	Concept(SkosEnum.Concept.getProperty()),
	altLabel(SkosEnum.altLabel.getProperty()),
	prefLabel(SkosEnum.prefLabel.getProperty()),
	scopeNote(SkosEnum.scopeNote.getProperty()),
	ConceptScheme(SkosEnum.ConceptScheme.getProperty()),
	Collection(SkosEnum.Collection.getProperty()),
	OrderedCollection(SkosEnum.OrderedCollection.getProperty()),
	changeNote(SkosEnum.changeNote.getProperty()),
	definition(SkosEnum.definition.getProperty()),
	editorialNote(SkosEnum.editorialNote.getProperty()),
	example(SkosEnum.example.getProperty()),
	hiddenLabel(SkosEnum.hiddenLabel.getProperty()),
	historyNote(SkosEnum.historyNote.getProperty()),
	notation(SkosEnum.notation.getProperty()),
	note(SkosEnum.note.getProperty())
	;
	private UriRef prop;
	
	SkosPropertiesEnum(UriRef value){
		if(value == null){
			throw new IllegalArgumentException("The property must not be null");
		}
		this.prop = value;
	}
	
	public UriRef getProperty(){
		return prop;
	}
}
