package eu.lh.skosifier.map.impl;

import static org.apache.stanbol.enhancer.servicesapi.rdf.Properties.RDF_TYPE;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.impl.TripleImpl;

import eu.lh.skosifier.CSVMapTypeEnum;
import eu.lh.skosifier.SkosEnum;
import eu.lh.skosifier.map.api.ColMap;

public class LocalIDMap implements ColMap {
	
	private int columID;
	private boolean unique;
	private CSVMapTypeEnum type;
	private SkosEnum rdfType;
	
	public LocalIDMap(int columID, CSVMapTypeEnum type, boolean unique, SkosEnum rdfType){
		this.columID = columID;
		this.type = type;
		this.unique = unique;
		this.rdfType = rdfType;
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
	public void doMap(Map<String, Referer> localIdMap, Map<String, String> toProcess,
			List<String> toMap, Referer referer, MGraph graphResult) {
		
		localIdMap.put(toMap.get(columID), referer);
		
		TripleImpl trp = new TripleImpl(referer.getRef(), RDF_TYPE, rdfType.getProperty());
		
		//TODO : skos:concept configurable ?
		graphResult.add(trp);
		// TODO Auto-generated method stub

	}

}
