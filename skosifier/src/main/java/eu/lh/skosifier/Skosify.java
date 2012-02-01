package eu.lh.skosifier;

import static org.apache.stanbol.enhancer.servicesapi.rdf.Properties.RDF_TYPE;


import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.xml.stream.events.Namespace;

import org.apache.clerezza.rdf.core.Language;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.impl.PlainLiteralImpl;
import org.apache.clerezza.rdf.core.impl.TripleImpl;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVStrategy;
import org.apache.commons.csv.writer.CSVConfig;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Service;
import org.apache.stanbol.enhancer.servicesapi.rdf.NamespaceEnum;
//import org.apache.stanbol.entityhub.servicesapi.model.Text;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.hp.hpl.jena.util.URIref;

import eu.lh.skosifier.api.Skosifier;

/**
 * 
 * @author florent
 *
 */
@Component(immediate = true, metatype = true)
@Service
public class Skosify implements Skosifier{
	
	private CSVStrategy strategy = CSVStrategy.DEFAULT_STRATEGY;
    /*private CSVConfig config = new CSVConfig();
    private boolean autogenColumns = true;
    private String delimiter;*/
    
    //private String orgName;
	private String orgId;
	private String thesaurusName;
	
	//TODO : make it configurable
    private String NSroot = "http://cuture-heritage.org/thesaurus/";
    
    //private String jsonConfig;
    
    private List<List<String>> csv;
    private UriRef graphName;
    
    //required default constructor for service
    public Skosify(){}
    
    private void initConfiguration(String jsonConfig) throws JSONException{
    	//this.jsonConfig = jsonConfig;
    	
    	JSONObject jo = new JSONObject(jsonConfig);
    	JSONObject meta = jo.getJSONObject("metadata");
		//orgName = meta.getString("organisationName");
		/*orgId = meta.getString("organisationID");
		thesaurusName = meta.getString("thesaurusName");*/
    	orgId = meta.getString(DCElementsEnum.creator.toString());
		thesaurusName = meta.getString(DCElementsEnum.title.toString());
		
		this.graphName = new UriRef(NSroot+orgId+"/"+thesaurusName);
    }
    
    public List<List<String>> getContent(){
    	return csv;
    }
    
    public MGraph skosify(Character delim, InputStream inputStream, String jsonConfig ) throws IOException, JSONException{
    	initConfiguration(jsonConfig);
    	csv = createCSV(delim, inputStream);
    	CSVMappeur mappeur = new CSVMappeur(jsonConfig);
    	return toSkos(mappeur);
    }
    
	private List<List<String>> createCSV(Character delim, InputStream inputStream) throws IOException{
			
		InputStreamReader in = new InputStreamReader(inputStream);
		strategy.setDelimiter(delim);
        
        try {
            CSVParser parser = new CSVParser(in, strategy);
            List<List<String>> list = new ArrayList<List<String>>();
            while (true) {
                String[] strings = parser.getLine();
                if (strings == null) {
                    break;
                }
                
                List<String> line = Arrays.asList(strings);
                list.add(line);
            }
            return list;
        } finally {
            in.close();
        }

	}
	
	private MGraph toSkos(CSVMappeur map){
		
		//TODO : get manager from OSGI stuff
		TcManager tcm = TcManager.getInstance();
		
		MGraph graph = tcm.createMGraph(graphName);
		boolean fistLineHeader;
		//TODO : set this parameter in function signature
		fistLineHeader = true;
		if (fistLineHeader){
			csv.remove(0);
		}
		
		
		map.doMap(csv, graph, graphName);
		
		return graph;
	}
	
	public UriRef getGraphName(){
		//create the graph name from medatada informations
		//TODO : add a way to have a generation function / some generation rules
		return graphName;
	}
	/*public String getOrgName() {
		return orgName;
	}

	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}*/

	public String getOrgId() {
		return orgId;
	}

	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}

	public String getThesaurusName() {
		return thesaurusName;
	}

	public void setThesaurusName(String thesaurusName) {
		this.thesaurusName = thesaurusName;
	}

	
}
