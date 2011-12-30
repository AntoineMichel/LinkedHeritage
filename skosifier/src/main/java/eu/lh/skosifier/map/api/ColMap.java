package eu.lh.skosifier.map.api;

import java.util.List;
import java.util.Map;

import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.UriRef;

import eu.lh.skosifier.CSVMapTypeEnum;
import eu.lh.skosifier.map.impl.Referer;

public interface ColMap {
	
	public int getColumID();
	public void setColumID( int columnID);
	public CSVMapTypeEnum getType();
	public void setType (CSVMapTypeEnum type);
	
	public void doMap(Map<String, Referer> localIdMap, Map<String, String> toProcess,
			List<String> toMap, Referer referer, MGraph graphResult);
	
}
