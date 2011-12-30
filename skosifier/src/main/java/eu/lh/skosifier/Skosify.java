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
    private CSVConfig config = new CSVConfig();
    private boolean autogenColumns = true;
    private String delimiter;
    
    private List<List<String>> csv;
    
    public Skosify(){}
    /*public Skosify(Character delim, InputStream inputStream) throws IOException{
    	csv = createCSV(delim, inputStream);
    }*/
    
    public List<List<String>> getContent(){
    	return csv;
    }
    
    public MGraph skosify(Character delim, InputStream inputStream, String jsonConfig ) throws IOException, JSONException{
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
		//TODO : build the graph name from organisation informations
		//TODO : get the graph name directly from the Mappeur
		//UriRef gname = new UriRef("http://someNameForExample.com");
		UriRef gname = new UriRef(map.getGraphName());
		MGraph graph = tcm.createMGraph(gname);
		boolean fistLineHeader;
		//TODO : set this parameter in function signature
		fistLineHeader = true;
		if (fistLineHeader){
			csv.remove(0);
		}
		
		
		map.doMap(csv, graph);
		
		return graph;
	}
	
}
