package eu.lh.skosifier;

import org.apache.clerezza.rdf.core.UriRef;
import org.apache.stanbol.enhancer.servicesapi.rdf.NamespaceEnum;

public enum SkosEnum {
	
	Concept(new UriRef(NamespaceEnum.skos+"Concept")),
	altLabel(new UriRef(NamespaceEnum.skos+"altLabel")),
	broader(new UriRef(NamespaceEnum.skos+"broader")),
	prefLabel(new UriRef(NamespaceEnum.skos+"prefLabel")),
	scopeNote(new UriRef(NamespaceEnum.skos+"scopeNote")),
	ConceptScheme(new UriRef(NamespaceEnum.skos+"ConceptScheme")),
	Collection(new UriRef(NamespaceEnum.skos+"Collection")),
	OrderedCollection(new UriRef(NamespaceEnum.skos+"OrderedCollection")),
	broadMatch(new UriRef(NamespaceEnum.skos+"broadMatch")),
	broaderTransitive(new UriRef(NamespaceEnum.skos+"broaderTransitive")),
	changeNote(new UriRef(NamespaceEnum.skos+"changeNote")),
	closeMatch(new UriRef(NamespaceEnum.skos+"closeMatch")),
	definition(new UriRef(NamespaceEnum.skos+"definition")),
	editorialNote(new UriRef(NamespaceEnum.skos+"editorialNote")),
	exactMatch(new UriRef(NamespaceEnum.skos+"exactMatch")),
	example(new UriRef(NamespaceEnum.skos+"example")),
	hasTopConcept(new UriRef(NamespaceEnum.skos+"hasTopConcept")),
	hiddenLabel(new UriRef(NamespaceEnum.skos+"hiddenLabel")),
	historyNote(new UriRef(NamespaceEnum.skos+"historyNote")),
	inScheme(new UriRef(NamespaceEnum.skos+"inScheme")),
	mappingRelation(new UriRef(NamespaceEnum.skos+"mappingRelation")),
	member(new UriRef(NamespaceEnum.skos+"member")),
	memberList(new UriRef(NamespaceEnum.skos+"memberList")),
	narrowMatch(new UriRef(NamespaceEnum.skos+"narrowMatch")),
	narrower(new UriRef(NamespaceEnum.skos+"narrower")),
	narrowerTransitive(new UriRef(NamespaceEnum.skos+"narrowerTransitive")),
	notation(new UriRef(NamespaceEnum.skos+"notation")),
	note(new UriRef(NamespaceEnum.skos+"note")),
	related(new UriRef(NamespaceEnum.skos+"related")),
	relatedMatch(new UriRef(NamespaceEnum.skos+"relatedMatch")),
	semanticRelation(new UriRef(NamespaceEnum.skos+"semanticRelation")),
	topConceptOf(new UriRef(NamespaceEnum.skos+"topConceptOf"))
	;
	
	private UriRef prop;
	
	SkosEnum(UriRef prop){
		if(prop == null){
			throw new IllegalArgumentException("The property must not be null");
		}
		this.prop = prop;
	}
	
	public UriRef getProperty(){
		return prop;
	}
	
	public static SkosEnum NSValueOf(String valueWithNS){
		if(valueWithNS.contains(":")){
			String[] a = valueWithNS.split(":");
			return valueOf(a[1]);
		}
		return valueOf(valueWithNS);
	}
}
