package eu.lh.skosifier;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.serializedform.Serializer;
import org.apache.commons.io.IOUtils;
import org.codehaus.jettison.json.JSONException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class CSVImportTest {
	
	Skosify s;
	String delim = "	"; 
	InputStream inputStream;
	
	@Before
	public void setup() throws IOException{
		
		inputStream = this.getClass().getResourceAsStream("/horn1.csv");
		//s = new Skosify(delim.charAt(0),inputStream);
		s = new Skosify();
	}
	
    //Test
	public void testimport(){
		
		List<List<String>> result = s.getContent();
        
		Assert.assertNotNull(result);
		
		Assert.assertEquals("ID", result.get(0).get(0));
		Assert.assertEquals("Algemene benaming voor alle soorten van (in aanbouw zijnde) gebouwen", result.get(3).get(5));
		
		System.out.println("-------------------------");
		System.out.println(result.get(4).get(1).trim());
		System.out.println("-------------------------");
		
	}
	
	@Test
	public void testEnum(){
		System.out.println("___________________________" + CSVMapTypeEnum.localID.name());
		System.out.println("___________________________" + CSVMapTypeEnum.localID.toString());
		Assert.assertTrue("localID" == CSVMapTypeEnum.localID.name());
		Assert.assertTrue("localID".equals(CSVMapTypeEnum.localID.name()));
		
	}
	
	@Test
	public void testToSkos() throws JSONException, IOException{
		
		String jsonMap = IOUtils.toString(this.getClass().getResourceAsStream("/mapping.json"));
		
		CSVMappeur mappeur = new CSVMappeur(jsonMap);
		
		Assert.assertNotNull(mappeur);
		Assert.assertNotNull(mappeur.getLocalID());
		
		MGraph mGraph = s.skosify(delim.charAt(0), inputStream, jsonMap);
		
		final Serializer serializer = Serializer.getInstance();
		//serializer.serialize(System.out, mGraph, "application/json");
		
		serializer.serialize(System.out, mGraph, "text/turtle");

	}
	
	
}
