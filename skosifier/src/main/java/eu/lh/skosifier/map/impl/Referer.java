package eu.lh.skosifier.map.impl;

import java.util.UUID;

import org.apache.clerezza.rdf.core.UriRef;

public class Referer {
	
	private UriRef ref = null;
	private UriRef graphName; 
	
	public Referer(UriRef graphName) {
		this.graphName = graphName;
	}

	public UriRef getRef() {
		if (ref == null){
			ref = new UriRef(graphName.getUnicodeString()+"/"+UUID.randomUUID().toString());
		}
		return ref;
	}

	public void setRef(UriRef ref) {
		this.ref = ref;
	}
	
	
}
