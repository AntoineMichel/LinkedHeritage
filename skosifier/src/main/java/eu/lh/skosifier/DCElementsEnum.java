package eu.lh.skosifier;

import org.apache.clerezza.rdf.core.UriRef;
import org.apache.stanbol.enhancer.servicesapi.rdf.NamespaceEnum;

public enum DCElementsEnum {
	
	title(new UriRef(DCNSEnum.dcElements+"title")),
	creator(new UriRef(DCNSEnum.dcElements+"creator")),
	subject(new UriRef(DCNSEnum.dcElements+"subject")),
	description(new UriRef(DCNSEnum.dcElements+"description")),
	publisher(new UriRef(DCNSEnum.dcElements+"publisher")),
	contributor(new UriRef(DCNSEnum.dcElements+"contributor")),
	date(new UriRef(DCNSEnum.dcElements+"date")),
	type(new UriRef(DCNSEnum.dcElements+"type")),
	format(new UriRef(DCNSEnum.dcElements+"format")),
	identifier(new UriRef(DCNSEnum.dcElements+"identifier")),
	source(new UriRef(DCNSEnum.dcElements+"source")),
	language(new UriRef(DCNSEnum.dcElements+"language")),
	relation(new UriRef(DCNSEnum.dcElements+"relation")),
	coverage(new UriRef(DCNSEnum.dcElements+"coverage")),
	rights(new UriRef(DCNSEnum.dcElements+"rights"))
	;
	
	
	UriRef prop;
	
	DCElementsEnum(UriRef prop){
		if(prop == null){
			throw new IllegalArgumentException("The property must not be null");
		}
		this.prop = prop;
	}
	
	public UriRef getProperty(){
		return prop;
	}
	
	public static DCElementsEnum NSValueOf(String valueWithNS){
		String[] a = valueWithNS.split(":");
		return valueOf(a[1]);
	}
	
	/**
	 * Provide the unicode string of the UriRef property 
	 */
	@Override
	public String toString(){
		return prop.getUnicodeString();
	}
}
