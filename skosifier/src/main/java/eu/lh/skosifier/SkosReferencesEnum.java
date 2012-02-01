package eu.lh.skosifier;

import org.apache.clerezza.rdf.core.UriRef;

public enum SkosReferencesEnum {
	broader(SkosEnum.broader.getProperty()),
	broadMatch(SkosEnum.broadMatch.getProperty()),
	broaderTransitive(SkosEnum.broaderTransitive.getProperty()),
	closeMatch(SkosEnum.closeMatch.getProperty()),
	exactMatch(SkosEnum.exactMatch.getProperty()),
	hasTopConcept(SkosEnum.hasTopConcept.getProperty()),
	inScheme(SkosEnum.inScheme.getProperty()),
	mappingRelation(SkosEnum.mappingRelation.getProperty()),
	narrowMatch(SkosEnum.narrowMatch.getProperty()),
	narrower(SkosEnum.narrower.getProperty()),
	narrowerTransitive(SkosEnum.narrowerTransitive.getProperty()),
	related(SkosEnum.related.getProperty()),
	relatedMatch(SkosEnum.relatedMatch.getProperty()),
	semanticRelation(SkosEnum.semanticRelation.getProperty()),
	topConceptOf(SkosEnum.topConceptOf.getProperty()),
	member(SkosEnum.member.getProperty()),
	memberList(SkosEnum.memberList.getProperty())
	;
	private UriRef prop;
	
	SkosReferencesEnum(UriRef value){
		if(value == null){
			throw new IllegalArgumentException("The property must not be null");
		}
		this.prop = value;
	}
	
	public UriRef getProperty(){
		return prop;
	}
}
