package eu.lh.skosifier;

import org.apache.clerezza.rdf.core.UriRef;
import org.apache.stanbol.enhancer.servicesapi.rdf.NamespaceEnum;

public enum SkosEnum {
	/*
	 * TODO : add this remaining properties
	 * skos:Collection  
skos:OrderedCollection 
skos:broadMatch 
skos:broaderTransitive 
skos:changeNote 
skos:closeMatch 
skos:definition 
skos:editorialNote 
skos:exactMatch 
skos:example 
skos:hasTopConcept 
skos:hiddenLabel 
skos:historyNote 
skos:inScheme 
skos:mappingRelation 
skos:member 
skos:memberList 
skos:narrowMatch 
skos:narrower 
skos:narrowerTransitive 
skos:notation 
skos:note 
skos:related 
skos:relatedMatch 
skos:semanticRelation 
skos:topConceptOf 

	 */
	Concept(new UriRef(NamespaceEnum.skos+"Concept")),
	altLabel(new UriRef(NamespaceEnum.skos+"altLabel")),
	broader(new UriRef(NamespaceEnum.skos+"broader")),
	prefLabel(new UriRef(NamespaceEnum.skos+"prefLabel")),
	scopeNote(new UriRef(NamespaceEnum.skos+"scopeNote")),
	ConceptScheme(new UriRef(NamespaceEnum.skos+"ConceptScheme"));
	
	UriRef prop;
	
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
		String[] a = valueWithNS.split(":");
		return valueOf(a[1]);
	}
}
