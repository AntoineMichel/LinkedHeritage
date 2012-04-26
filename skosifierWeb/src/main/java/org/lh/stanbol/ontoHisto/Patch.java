package org.lh.stanbol.ontoHisto;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.NonLiteral;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.impl.TripleImpl;
import org.apache.clerezza.rdf.core.impl.util.W3CDateFormat;
import org.apache.stanbol.enhancer.servicesapi.rdf.Properties;

import eu.lh.skosifier.LHOntology;

public class Patch {
	
	public Patch(){};
	
	//convenient method to translate filter's iterator to a collection
    private Collection<Triple> toCollection(Iterator<Triple> iter){
    	Collection<Triple> res = new ArrayList<Triple>();
    	while(iter.hasNext()) res.add(iter.next());
    	return res;
    }
	
    private Collection<Triple> sortChanges(Iterator<Triple> changes,Graph histoGraph){
    	final String keyName = "date";
    	ArrayList<Triple> a = new ArrayList<Triple>();
    	//for each change
    	while (changes.hasNext()){
    		TripleWProps trp = new TripleWProps(changes.next());
        	//get the date value and add it to the Triple
        	trp.setProp(keyName, histoGraph.filter((UriRef)trp.getObject(), LHOntology.date.getProperty(), null).next().getObject());
        	a.add(trp);
    	}
    	
    	//TODO : create tests for this and use real dates
    	Comparator<Triple> dateCompare = new Comparator<Triple>() {
			@Override
			public int compare(Triple o1, Triple o2) {
				if(o1.getObject().equals(o2.getObject())){
					return 0;
				}
				int v1 = Integer.parseInt(((Literal)((TripleWProps)o1).getProp(keyName)).getLexicalForm());
				int v2 = Integer.parseInt(((Literal)((TripleWProps)o2).getProp(keyName)).getLexicalForm());
				return v1 - v2;
			}    		
		};
		Collections.sort(a, dateCompare );
		
    	return a;
    }
    
    /**
     * Save histories/diffs inside the TcManager. Don't apply them, only save.
     * @param histoGraph
     * @param tcManager
     */
    public void saveDiffs(Graph histoGraph, TcManager tcManager){
    	//TODO : create a test for this function
    	Iterator<Triple> histories = histoGraph.filter(null, Properties.RDF_TYPE, LHOntology.history.getProperty());
        while(histories.hasNext()){
        	Triple h = histories.next();
        	MGraph historyG = tcManager.getMGraph((UriRef)h.getSubject());
        	historyG.addAll(toCollection(histoGraph.filter(h.getSubject(), null, null)));
        	//end adding the change graph to the global history graph
        }
    }
    
    
    //TODO change to use atomDiff
    private AtomDiff getOldNewValues(UriRef changeTripleSubject, Graph histoGraph){
    	
    	AtomDiff result = new AtomDiff();
    	
    	Iterator<Triple> iterOldValues = histoGraph.filter(changeTripleSubject,LHOntology.element.getProperty(),null);
    	Iterator<Triple> iterNewValues = histoGraph.filter(changeTripleSubject,LHOntology.newValue.getProperty(),null);
    	
    	result.oldValue = iterOldValues.hasNext() ? iterOldValues.next().getObject() : null;
    	result.newValue = iterNewValues.hasNext() ? iterNewValues.next().getObject() : null;
    	
		return result;
    }
    
    /**
     * Apply the history graph to the graph stack managed by TcManager
     * @param histoGraph
     * @param tcManager
     * @return
     */
    //TODO : return an Mgraph mean nothing, as it will only return the last processed one.
    //Change the method signature. Send an error if problem during processing ?
    // replace the mgraph return by an array/list of uri of modified graph.
	public MGraph apply(Graph histoGraph, TcManager tcManager){
		MGraph gToChange = null;        
                
        //processing history file
        //get history "root"
        Iterator<Triple> histories = histoGraph.filter(null, Properties.RDF_TYPE, LHOntology.history.getProperty());
        
        while(histories.hasNext()){
        	List<Triple> rmTripleList = new ArrayList<Triple>();
			List<Triple> addTripleList = new ArrayList<Triple>();
			
        	Triple h = histories.next();
        	
        	//process
        	//get the related graph, only get the first one (no mean to have many graphs here ?)
        	Triple trpForGraphToChange = histoGraph.filter(h.getSubject(),LHOntology.historyOf.getProperty(),null).next();
        	//get the modifiable graph
        	gToChange = tcManager.getMGraph((UriRef)trpForGraphToChange.getObject());
        	//get the list of changes
        	Iterator<Triple> changes = histoGraph.filter(h.getSubject(), LHOntology.change.getProperty(),null);
        	//change list is sorted by date ascending
        	Collection<Triple> sc = sortChanges(changes,histoGraph);
        	Iterator<Triple> isc = sc.iterator();
        	while(isc.hasNext()){
        		Triple c = isc.next();
        		UriRef changeRef = (UriRef)c.getObject();
        		
        		//get changed subjects
        		Iterator<Triple> changedSubjects = histoGraph.filter(changeRef,LHOntology.subject.getProperty(),null);
        		//get the change node
        		while(changedSubjects.hasNext()){
        			
        			UriRef subjectToChange = (UriRef)changedSubjects.next().getObject();
        			AtomDiff subjectOldNew = getOldNewValues(subjectToChange, histoGraph);
        			
        			Iterator<Triple> changedProps = histoGraph.filter(subjectToChange,LHOntology.property.getProperty(),null);
        			
        			while(changedProps.hasNext()){
        				UriRef propToChange = (UriRef)changedProps.next().getObject();
        				AtomDiff propOldNew = getOldNewValues(propToChange, histoGraph);
        				
        				Iterator<Triple> changedObjects = histoGraph.filter(propToChange,LHOntology.object.getProperty(),null);
        				
        				while(changedObjects.hasNext()){
        					UriRef objectToChange = (UriRef)changedObjects.next().getObject();
        					AtomDiff objectOldNew = getOldNewValues(objectToChange, histoGraph);
        					
        					//test if there is no null value in old atom in order to create the old triple to remove
        					if (subjectOldNew.oldValue != null && propOldNew != null && objectOldNew != null){
        						rmTripleList.add(new TripleImpl((NonLiteral)subjectOldNew.oldValue, (UriRef)propOldNew.oldValue, (Resource)objectOldNew.oldValue));
        					}
        					//add the new triple (in worth case the same triple that already exist ie no new value, just old ones)
        					addTripleList.add(new TripleImpl((NonLiteral)subjectOldNew.newValue, (UriRef)propOldNew.newValue, (Resource)objectOldNew.newValue));
        				}
        			}
        		}
        	}
        	gToChange.removeAll(rmTripleList);
    		gToChange.addAll(addTripleList);
        }
        return gToChange;
	}
}
