package eu.lh.skosifier.map.impl;

import java.util.UUID;

import org.apache.clerezza.rdf.core.UriRef;

public class Referer {
	
	private UriRef ref = null;

	public Referer() {
		super();
	}

	public UriRef getRef() {
		if (ref == null){
			ref = new UriRef("http://defineURL.com/"+UUID.randomUUID().toString());
		}
		return ref;
	}

	public void setRef(UriRef ref) {
		this.ref = ref;
	}
	
	
}
