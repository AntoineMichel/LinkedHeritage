package eu.lh.skosifier.map.impl;

import java.util.List;
import java.util.Map;

import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.impl.TripleImpl;

import eu.lh.skosifier.CSVMapTypeEnum;
import eu.lh.skosifier.SkosEnum;
import eu.lh.skosifier.map.api.ColMap;

public class RefMap implements ColMap{

	private int columID;
	private CSVMapTypeEnum type;
	private SkosEnum refType;
	private int columRefId;
	
	
	public RefMap(int columID, CSVMapTypeEnum type, SkosEnum refType,
			int columRefId) {
		super();
		this.columID = columID;
		this.type = type;
		this.refType = refType;
		this.columRefId = columRefId;
	}
	
	
	public SkosEnum getRefType() {
		return refType;
	}


	public void setRefType(SkosEnum refType) {
		this.refType = refType;
	}


	public int getColumRefId() {
		return columRefId;
	}


	public void setColumRefId(int columRefId) {
		this.columRefId = columRefId;
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
		
		//manage references to broader
		String ref = toMap.get(columID); 
		if(!ref.equals("") || ref != null){
			if(localIdMap.containsKey(ref)){
				graphResult.add(new TripleImpl(referer.getRef(), refType.getProperty(), localIdMap.get(ref).getRef()));
			}
			else{
				//TODO : add to the error graph tracker
				/*properties à passer ?
				 * idkey
				referer
				toMap*/
			}
		}
		
	}

}
