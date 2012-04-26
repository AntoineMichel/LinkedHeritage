package org.lh.stanbol.ontoHisto;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.serializedform.Parser;
import org.apache.clerezza.rdf.core.serializedform.UnsupportedFormatException;
import org.apache.commons.io.IOUtils;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

public class PatchTest {
	
	private UriRef graphNameOne = new UriRef("http://ontoHisto.testGraph/1");
	
	private TcManager tcm;
	private Parser parser;
	
	private Graph parseTestFile(String fileName) throws UnsupportedFormatException, FileNotFoundException{
		
		return parser.parse(this.getClass().getClassLoader().getResourceAsStream(fileName), "application/rdf+xml");
	}
	
	@Before
	public void initTcManager(){
		tcm = TcManager.getInstance();
		tcm.createMGraph(graphNameOne);
		
		parser = Parser.getInstance();
	}
	
	
	@Test
	public void testAddNewTriple() throws UnsupportedFormatException, FileNotFoundException{
		Graph hg = parseTestFile("add-a-new-mapping-relation.xml");
		Assert.assertNotNull(hg);
		
		//for now, size of the graphOne in 0
		MGraph og = tcm.getMGraph(graphNameOne);
		Assert.assertEquals(0, og.size());
		
		Patch p = new Patch();
		p.apply(hg, tcm);
		
		//Now the size is different than one
		og = tcm.getMGraph(graphNameOne);
		Assert.assertNotSame(0, og.size());
		
		
		
	}
	
}
