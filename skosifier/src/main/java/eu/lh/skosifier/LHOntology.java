package eu.lh.skosifier;

import org.apache.clerezza.rdf.core.UriRef;

public enum LHOntology {
	//mapping part
	graphMapping(new UriRef(LHbaseURL.mappingBaseUrl+"graphMapping")),
	mappedGraph(new UriRef(LHbaseURL.mappingBaseUrl+"mappedGraph")),
	
	//history part
	history(new UriRef(LHbaseURL.lhBaseHistory+"history")),
	historyOf(new UriRef(LHbaseURL.lhBaseHistory+"historyOf")),
	//--- change content
	change(new UriRef(LHbaseURL.lhBaseHistory+"change")),
	from(new UriRef(LHbaseURL.lhBaseHistory+"from")),
	date(new UriRef(LHbaseURL.lhBaseHistory+"date")),
	user(new UriRef(LHbaseURL.lhBaseHistory+"user")),
	comment(new UriRef(LHbaseURL.lhBaseHistory+"comment")),
	subject(new UriRef(LHbaseURL.lhBaseHistory+"subject")),
	property(new UriRef(LHbaseURL.lhBaseHistory+"property")),
	object(new UriRef(LHbaseURL.lhBaseHistory+"object")),
	//diff(new UriRef(LHbaseURL.lhBaseHistory+"diff")),
	//--- diff content
	element(new UriRef(LHbaseURL.lhBaseHistory+"element")),
	newValue(new UriRef(LHbaseURL.lhBaseHistory+"newValue")),
	delete(new UriRef(LHbaseURL.lhBaseHistory+"delete"))
	//oldValue(new UriRef(LHbaseURL.lhBaseHistory+"oldValue"))
	;
	private UriRef prop;
	
	LHOntology(UriRef value){
		if(value == null){
			throw new IllegalArgumentException("The property must not be null");
		}
		this.prop = value;
	}
	
	public UriRef getProperty(){
		return prop;
	}
}
