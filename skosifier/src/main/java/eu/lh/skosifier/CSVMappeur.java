package eu.lh.skosifier;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.UriRef;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import eu.lh.skosifier.map.api.ColMap;
import eu.lh.skosifier.map.impl.LocalIDMap;
import eu.lh.skosifier.map.impl.RefMap;
import eu.lh.skosifier.map.impl.Referer;
import eu.lh.skosifier.map.impl.ValueMap;

public class CSVMappeur {
	
	private ColMap localID;
	private List<ColMap> mapList;
	
	
	
	public CSVMappeur(String json) throws JSONException{
		mapList = new ArrayList<ColMap>();
		//TODO : set up a configuration throw JSON
		//JSONObject jQuery = new JSONObject(jsonQueryString);
		//see : FromJSON in org.apache.stanbol.entityhub.jersey/src/main/java/org/apache/stanbol/entityhub/jersey/parsers/FieldQueryReader.java
		JSONObject jo = new JSONObject(json);
		
		JSONArray mapping = jo.getJSONArray("mapping");
		for (int i= 0 ; i < mapping.length() ; i++ ){
			JSONObject colMapping = mapping.getJSONObject(i);
			int colIndex = colMapping.getInt("columnId");
			String type = colMapping.getString("type");
			
			if(type.equals(CSVMapTypeEnum.localID.name())){
				boolean unique = colMapping.optBoolean("unique", true);
				String rt = colMapping.getString("rdfType");
				//mapList.add(new LocalIDMap(colIndex, CSVMapTypeEnum.localID, unique, SkosEnum.NSValueOf(rt)));
				localID = new LocalIDMap(colIndex, CSVMapTypeEnum.localID, unique, SkosEnum.NSValueOf(rt));
			}
			if(type.equals(CSVMapTypeEnum.propertyValue.name())){
				String pt = colMapping.getString("propType");
				String lang = colMapping.optString("lang", null);
				mapList.add(new ValueMap(colIndex, CSVMapTypeEnum.propertyValue, SkosEnum.NSValueOf(pt), lang));
			}
			if(type.equals(CSVMapTypeEnum.propertyRef.name())){
				String rt = colMapping.getString("propType");
				int colRefId = colMapping.getInt("columnRefId");
				mapList.add(new RefMap(colIndex, CSVMapTypeEnum.propertyRef, SkosEnum.NSValueOf(rt), colRefId));
			}
			
		}
		
	}
	
	public ColMap getLocalID() {
		return localID;
	}

	public void setLocalID(ColMap localID) {
		this.localID = localID;
	}

	public List<ColMap> getMapList() {
		return mapList;
	}

	public void setMapList(List<ColMap> mapList) {
		this.mapList = mapList;
	}

	public void doMap(List<List<String>> values, MGraph graph, UriRef graphName){
		Map<String,Referer> localUUID = new HashMap<String, Referer>();
		
		//TODO : see if string/string is okay
		//maybe more : Lsit<String>,ColMap : getall the informations and how to process it
		Map<String,String> toProcess = new HashMap<String,String>();
		
		for(List<String> l  : values){
			//UriRef referer = new UriRef("http://TESTAREVOIR-DANSCSVMAPPEUR.com/"+UUID.randomUUID().toString());
			Referer referer = new Referer(graphName);
			localID.doMap(localUUID, toProcess, l, referer, graph);
			
			for(ColMap m : mapList){
				m.doMap(localUUID, toProcess, l, referer, graph);
			}

		}
		
		//TODO : process resulting in Toprocess
		
		//TODO : 

	}	
	
}
