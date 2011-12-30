package eu.lh.skosifier.map.impl;

import java.util.List;
import java.util.Map;

import org.apache.clerezza.rdf.core.Language;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.impl.PlainLiteralImpl;
import org.apache.clerezza.rdf.core.impl.TripleImpl;

import eu.lh.skosifier.CSVMapTypeEnum;
import eu.lh.skosifier.SkosEnum;
import eu.lh.skosifier.map.api.ColMap;

public class ValueMap implements ColMap {
	
	private int columID;
	private CSVMapTypeEnum type;
	private SkosEnum propType;
	private String lang;
	
	public ValueMap(int columID, CSVMapTypeEnum type, SkosEnum propType,
			String lang) {
		super();
		this.columID = columID;
		this.type = type;
		this.propType = propType;
		this.lang = lang;
	}

	@Override
	public int getColumID() {
		return columID;
	}

	@Override
	public void setColumID(int columnID) {
		this.columID = columnID;

	}

	@Override
	public CSVMapTypeEnum getType() {
		return type;
	}

	@Override
	public void setType(CSVMapTypeEnum type) {
		this.type = type;

	}

	@Override
	public void doMap(Map<String, Referer> localIdMap,
			Map<String, String> toProcess, List<String> toMap, Referer referer,
			MGraph graphResult) {
		
		String value = toMap.get(columID).trim();
		if(value != null && !value.equals("")){
			Literal literal = new PlainLiteralImpl(value);
			if (lang != null){
				literal = new PlainLiteralImpl(value, new Language(lang));
			}
			
			Triple trp = new TripleImpl(referer.getRef(), propType.getProperty(), literal);
			graphResult.add(trp);
		}
		
	}

}
