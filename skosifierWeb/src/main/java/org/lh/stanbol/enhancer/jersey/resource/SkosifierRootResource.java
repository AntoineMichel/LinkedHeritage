/*
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
package org.lh.stanbol.enhancer.jersey.resource;

import static javax.ws.rs.core.MediaType.APPLICATION_FORM_URLENCODED;
import static javax.ws.rs.core.MediaType.TEXT_HTML;
import static javax.ws.rs.core.MediaType.TEXT_PLAIN;
import static javax.ws.rs.core.MediaType.WILDCARD;
import static javax.ws.rs.core.MediaType.MULTIPART_FORM_DATA;
import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static org.apache.clerezza.rdf.core.serializedform.SupportedFormat.RDF_XML;
import static org.apache.stanbol.commons.web.base.CorsHelper.addCORSOrigin;
import static org.apache.stanbol.commons.web.base.CorsHelper.enableCORS;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.servlet.ServletContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.FormParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.NonLiteral;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.MGraphServiceFactory;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.impl.TripleImpl;
import org.apache.clerezza.rdf.core.serializedform.Parser;
import org.apache.clerezza.rdf.core.serializedform.Serializer;
import org.apache.clerezza.rdf.utils.MGraphUtils;
import org.apache.commons.io.IOUtils;
import org.apache.stanbol.commons.web.base.ContextHelper;
import org.apache.stanbol.commons.web.base.resource.BaseStanbolResource;
import org.apache.stanbol.enhancer.servicesapi.EngineException;
import org.apache.stanbol.enhancer.servicesapi.rdf.Properties;
import org.apache.stanbol.enhancer.servicesapi.rdf.TechnicalClasses;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.codehaus.jettison.json.JSONArray;
import org.mortbay.util.ajax.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.jersey.api.view.Viewable;
import com.sun.jersey.multipart.FormDataParam;

import eu.lh.skosifier.CSVMapTypeEnum;
import eu.lh.skosifier.LHOntology;
import eu.lh.skosifier.LHbaseURL;
import eu.lh.skosifier.SkosEnum;
import eu.lh.skosifier.SkosPropertiesEnum;
import eu.lh.skosifier.SkosReferencesEnum;
import eu.lh.skosifier.Skosify;
import eu.lh.skosifier.api.Skosifier;

/**
 * RESTful interface to browse the list of available engines and allow to call them in a stateless,
 * synchronous way.
 * <p>
 * If you need the content of the extractions to be stored on the server, use the StoreRootResource API
 * instead.
 * @param <e>
 */
@Path("/skosifier")
public class SkosifierRootResource<e> extends BaseStanbolResource {

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Skosifier skosifier;

    protected TcManager tcManager;

    protected Serializer serializer;
    
    protected Parser parser;

    /*
     * serialize in json :
     * ByteArrayOutputStream out = new ByteArrayOutputStream();
        serializer.serialize(out, g, SupportedFormat.RDF_JSON);
        
        String rdfString = out.toString("utf-8");
        return rdfString;
     */
    
    public SkosifierRootResource(@Context ServletContext context) {
        // bind the job manager by looking it up from the servlet request context
        //jobManager = ContextHelper.getServiceFromContext(EnhancementJobManager.class, context);
    	skosifier = ContextHelper.getServiceFromContext(Skosifier.class, context);
        tcManager = ContextHelper.getServiceFromContext(TcManager.class, context);
        serializer = ContextHelper.getServiceFromContext(Serializer.class, context);
        parser = ContextHelper.getServiceFromContext(Parser.class, context);
    }
    
    @OPTIONS
    public Response handleCorsPreflight(@Context HttpHeaders headers){
        ResponseBuilder res = Response.ok();
        enableCORS(servletContext,res, headers);
        return res.build();
    }

    @GET
    @Produces(TEXT_HTML)
    public Response get(@Context HttpHeaders headers) {
        ResponseBuilder res = Response.ok(new Viewable("index", this),TEXT_HTML);
        addCORSOrigin(servletContext,res, headers);
        return res.build();
    }

    @GET
    @Consumes(WILDCARD)
    public Response getGraph(@QueryParam(value = "uri") String uri,
                                    @Context HttpHeaders headers){
    	//MGraph graph = tcManager.getInstance().getMGraph(new UriRef(uri));
    	MGraph graph = tcManager.getMGraph(new UriRef(uri));
    	tcManager.getProviderList().first().listGraphs();
    	
    	return okGraphResponse(headers, graph);
    }
    
    
    @Path("/graphlist")
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getGraphList(@Context HttpHeaders headers) throws JSONException {
    	JSONObject jo = new JSONObject();
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator(); 
    	while (iter.hasNext()){
    		jo.accumulate("graphUri", iter.next().getUnicodeString());
    	}
    	ResponseBuilder rb = Response.ok(jo.toString());
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    
    @Path("/graphlink")
    @GET
    @Consumes(WILDCARD)
    //Produces(MediaType.APPLICATION_JSON)
    public Response getGraphLink(@Context HttpHeaders headers,
    			@QueryParam(value = "graphOne") String graphOne,
    			@QueryParam(value = "graphTwo") String graphTwo) throws JSONException {
    	//JSONObject jo = new JSONObject();
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator();
    	UriRef o1 = new UriRef(graphOne);
		UriRef o2 = new UriRef(graphTwo);
		System.out.println(o1);
		System.out.println(o2);
		boolean finded = false;
    	MGraph mg = null;
    	while (iter.hasNext() && !finded){
    		UriRef rf = iter.next();
    		mg = tcManager.getMGraph(rf);
    		
    		Triple tun = new TripleImpl(rf, LHOntology.mappedGraph.getProperty(), o1);
    		Triple tde = new TripleImpl(rf, LHOntology.mappedGraph.getProperty(), o2);
    		//Triple tun = new TripleImpl(new UriRef("http://testgraph.com/testLink"), LHOntology.mappedGraph.getProperty(), new UriRef("http://cuture-heritage.org/thesaurus/florent/testFullCSVimport"));
			//Triple tde = new TripleImpl(new UriRef("http://testgraph.com/testLink"), LHOntology.mappedGraph.getProperty(), new UriRef("http://cuture-heritage.org/thesaurus/organisationID/nameTest3"));
    		Collection<Triple> cl = new ArrayList<Triple>();
    		cl.add(tun);
    		cl.add(tde);
    		System.out.print(rf);
    		System.out.print("  ");
    		System.out.println(mg.containsAll(cl));
    		
			if(mg.containsAll(cl)){
				finded = true;
			}
			
    		
    		/*Iterator<Triple> res = g.filter(null, Properties.RDF_TYPE, new UriRef(LHOntology.graphMapping.getProperty().getUnicodeString()));
    		if(res.hasNext()){
    			Triple trp = res.next();
    			g.filter(trp.getSubject(), LHOntology.mappedGraph.getProperty(), null);
    			System.out.println(trp.toString());
    			//TODO : test with a collection and
    			//Collection<Triple> cl = new ArrayList<Triple>();
    			//g.containsAll(cl);
    			
    		}*/
    	}
    	if(!finded){
    		//UriRef gref = new UriRef("http://testgraph.com/testLink");
    		UriRef gref = new UriRef(LHbaseURL.lhBaseMapping + UUID.randomUUID().toString());
    		mg = tcManager.createMGraph(gref);
        	mg.add(new TripleImpl(gref, Properties.RDF_TYPE, LHOntology.graphMapping.getProperty()));
        	mg.add(new TripleImpl(gref, LHOntology.mappedGraph.getProperty(), o1));
        	mg.add(new TripleImpl(gref, LHOntology.mappedGraph.getProperty(), o2));
    		
    		//history management testing
    		//-- history root creation
        	/*mg.add(new TripleImpl(gref, Properties.RDF_TYPE, LHOntology.history.getProperty()));
        	mg.add(new TripleImpl(gref, LHOntology.historyOf.getProperty(), o1));
        	UriRef change1 = new UriRef("urn:change-id-1");
        	mg.add(new TripleImpl(gref, LHOntology.change.getProperty(), change1));
        	//change creation
        	mg.add(new TripleImpl(change1, Properties.RDF_TYPE, LHOntology.change.getProperty()));
        	mg.add(new TripleImpl(change1, LHOntology.from.getProperty(), new UriRef("http://useAlitteral.here/0.0.1")));
        	
        	UriRef newS = new UriRef("http://culture-heritage/existing/SKOS/concept/1234"); //new source concept
        	
        	mg.add(new TripleImpl(change1, LHOntology.subject.getProperty(), newS));
        	mg.add(new TripleImpl(change1, LHOntology.date.getProperty(), new UriRef("http://useAlitteral.here/Date-XML-Format")));
        	mg.add(new TripleImpl(change1, LHOntology.user.getProperty(), new UriRef("http://useAlitteral.here/USER-ID")));
        	mg.add(new TripleImpl(change1, LHOntology.comment.getProperty(), new UriRef("http://useAlitteral.here/a-user-comment-here")));
        	
        	UriRef diff1 = new UriRef("http://diff1.yo"); //create the property
        	UriRef diff2 = new UriRef("http://diff2.yo"); //create the target object
        	
        	//add the diffs to the change
        	mg.add(new TripleImpl(change1, LHOntology.diff.getProperty(), diff1));
        	mg.add(new TripleImpl(change1, LHOntology.diff.getProperty(), diff2));
        	
        	//create the diff1 : add the property
        	mg.add(new TripleImpl(diff1, Properties.RDF_TYPE, LHOntology.diff.getProperty()));
        	mg.add(new TripleImpl(diff1, LHOntology.element.getProperty(), new UriRef("http://useAlitteral.here.OR.a-property-in-the-histo-onto/property")));
        	mg.add(new TripleImpl(diff1, LHOntology.newValue.getProperty(), SkosEnum.closeMatch.getProperty()));
        	
        	//create the diff2 : add the node
        	mg.add(new TripleImpl(diff2, Properties.RDF_TYPE, LHOntology.diff.getProperty()));
        	mg.add(new TripleImpl(diff2, LHOntology.element.getProperty(), new UriRef("http://useAlitteral.here.OR.a-property-in-the-histo-onto/object")));
        	mg.add(new TripleImpl(diff2, LHOntology.newValue.getProperty(), new UriRef("http://culture-heritage/existing/SKOS/concept/TARGETofLINK")));
    		*/
    	}
    	
    	
    	
    	
    	/*MGraph mg = tcManager.createMGraph(new UriRef("http://testgraph.com/testLink"));
    	mg.add(new TripleImpl(new UriRef("http://testgraph.com/testLink"), Properties.RDF_TYPE, new UriRef(LHOntology.graphMapping.getProperty().getUnicodeString())));
    	mg.add(new TripleImpl(new UriRef("http://testgraph.com/testLink"), LHOntology.mappedGraph.getProperty(), new UriRef("http://cuture-heritage.org/thesaurus/florent/testFullCSVimport")));
    	mg.add(new TripleImpl(new UriRef("http://testgraph.com/testLink"), LHOntology.mappedGraph.getProperty(), new UriRef("http://cuture-heritage.org/thesaurus/organisationID/nameTest3")));
    	*/
    	//MGraph mg = tcManager.getMGraph(new UriRef("http://testgraph.com/testLink"));
    	
    	/*ResponseBuilder rb = Response.ok(JSON.toString(.graphOne..));
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();*/
    	return okGraphResponse(headers, mg);
    }
    
    
    //convenient method to translate filter's iterator to a collection
    private Collection<Triple> toCollection(Iterator<Triple> iter){
    	Collection<Triple> res = new ArrayList<Triple>();
    	while(iter.hasNext()) res.add(iter.next());
    	return res;
    }
    
    //end point for commiting changes
    @Path("/changes")
    @POST
    @Consumes(APPLICATION_FORM_URLENCODED)
    public Response changeCommit(@FormParam(value ="change") String jsonConfig, 
    								@Context HttpHeaders headers) throws EngineException, IOException {
        
    	/*String format = TEXT_PLAIN;
        if (headers.getMediaType() != null) {
            format = headers.getMediaType().toString();
        }*/
        
    	MGraph gToChange = null;
    	
        //TODO : get format from the headers
    	//TODO : check if the json format is created as a parser
        Graph changeGraph = parser.parse(IOUtils.toInputStream(jsonConfig), "application/rdf+xml");
        
        //get history "root"
        Iterator<Triple> histories = changeGraph.filter(null, Properties.RDF_TYPE, LHOntology.history.getProperty());
        
        System.out.println("get histories");
        while(histories.hasNext()){
        	Triple h = histories.next();
        	//get the related graph, only get the first one (no mean to have many graphs here ?)
        	Triple trpForGraphToChange = changeGraph.filter(h.getSubject(),LHOntology.historyOf.getProperty(),null).next();
        	//get the modifiable graph
        	gToChange = tcManager.getMGraph((UriRef)trpForGraphToChange.getObject());
        	//get the list of changes
        	Iterator<Triple> changes = changeGraph.filter(h.getSubject(), LHOntology.change.getProperty(),null);
        	//TODO : be carefull : the changes have to be sorted by date ascending before processing
        	System.out.println("list of changes");
        	while(changes.hasNext()){
        		Triple c = changes.next();
        		System.out.println(c);
        		UriRef changeRef = (UriRef)c.getObject();
        		
        		Collection<Triple> toRemove = new ArrayList<Triple>();
        		Collection<Triple> toAdd = new ArrayList<Triple>();
        		
        		//TODO : create a recursive function for traitment
        		//for dealing with indice and lhontology.* ==> have an array with this properties and run throw this array
        		
        		//get changed subjects
        		Iterator<Triple> changedSubjects = changeGraph.filter(changeRef,LHOntology.subject.getProperty(),null);
        		//get the change node
        		while(changedSubjects.hasNext()){
        			//DiffObject currentDiff = new DiffObject();
        			List<Triple> rmTripleList = new ArrayList<Triple>();
        			List<Triple> addTripleList = new ArrayList<Triple>();
        			
        			
        			List<Resource> rmFilterTriple = new ArrayList<Resource>();
        			rmFilterTriple.add(null);
        			rmFilterTriple.add(null);
        			rmFilterTriple.add(null);
        			List<Resource> addTriple = new ArrayList<Resource>();
        			addTriple.add(null);
        			addTriple.add(null);
        			addTriple.add(null);
        			UriRef subjectToChange = (UriRef)changedSubjects.next().getObject();
        			//normally unique
        			NonLiteral subjectElement = (NonLiteral)changeGraph.filter(subjectToChange,LHOntology.element.getProperty(),null).next().getObject();
        			//TODO : check if new value
        			//do this mean something for the subject ? change the urn for the subject don't mean something...
        			//this mean if the new value is delete, because then remove all the node
        			Iterator<Triple> newSubjectList = changeGraph.filter(subjectToChange,LHOntology.newValue.getProperty(),null);
        			NonLiteral newSubject = newSubjectList.hasNext() ? (NonLiteral)newSubjectList.next().getObject() : null; 
        			
        			Iterator<Triple> changedProps = changeGraph.filter(subjectToChange,LHOntology.property.getProperty(),null);
        			
        			if(newSubject != null){
        				if (newSubject.equals(LHOntology.delete.getProperty())){
        					rmFilterTriple.remove(0);
        					rmFilterTriple.add(0,subjectElement);
            			}
        				else{
        					rmFilterTriple.remove(0);
        					rmFilterTriple.add(0,subjectElement);
        					addTriple.remove(0);
        					addTriple.add(0,newSubject);
        				}
        			}
        			//if no newSubject, this is a modification of the triple or and addition
        			else{
        				rmFilterTriple.remove(0);
        				rmFilterTriple.add(0,subjectElement);
        				addTriple.remove(0);
        				addTriple.add(0,subjectElement);
        			}
        			
        			//if no properties changed, we want to remove the subject and all this properties
        			if (!changedProps.hasNext()){
        				rmTripleList.addAll(toCollection(gToChange.filter((NonLiteral)rmFilterTriple.get(0), null, null)));
        				//rmFilterTriple.add(null);
        				//rmFilterTriple.add(null);
        			}
        			
        			
        			System.out.println("get the subject to change");
        			System.out.println(subjectElement);
        			
        			//get changed properties
            		while(changedProps.hasNext()){
            			UriRef propsToChange = (UriRef)changedProps.next().getObject();
            			//normally unique
            			UriRef propElement = (UriRef)changeGraph.filter(propsToChange,LHOntology.element.getProperty(),null).next().getObject();
            			//check if new value
            			Iterator<Triple> newPropList = changeGraph.filter(propsToChange,LHOntology.newValue.getProperty(),null);
            			UriRef newProp = newPropList.hasNext() ? (UriRef)newPropList.next().getObject() : null; 
            			
            			//get changed objects
                		Iterator<Triple> changedObjs = changeGraph.filter(propsToChange,LHOntology.object.getProperty(),null);
            			
            			if(newProp != null){
            				if (newProp.equals(LHOntology.delete.getProperty())){
            					rmFilterTriple.remove(1);
            					rmFilterTriple.add(1,propElement);
                			}
            				else{
            					rmFilterTriple.remove(1);
            					rmFilterTriple.add(1,propElement);
            					addTriple.remove(1);
            					addTriple.add(1,newProp);
            				}
            			}
            			//if no newSubject, this is a modification of the triple or and addition
            			else{
            				rmFilterTriple.remove(1);
            				rmFilterTriple.add(1,propElement);
            				addTriple.remove(1);
            				addTriple.add(1,propElement);
            			}
            			//if no object changed, we want to remove the all object with this property
            			if (!changedObjs.hasNext()){
            				rmTripleList.addAll(toCollection(gToChange.filter((NonLiteral)rmFilterTriple.get(0), (UriRef)rmFilterTriple.get(1), null)));
            				//rmTripleList.add(new TripleImpl());
            				//rmFilterTriple.add(null);
            			} 
            			
            			System.out.println("get the prop to change");
            			System.out.println(propElement);
            			
            			/*** minimal block **/
            			/*** note : for create a minimal block : 
            			 * use an "anonymouse function
            			 * change subject/property and object node by "atom" ou "tripleAtom" ou "tatom" (they are used for filter)
            			 * see how to deal with delete on a property level : delete all properties don't "really" means something
            			 */
            			
                		
                		//get the change node
                		while(changedObjs.hasNext()){
                			UriRef objToChange = (UriRef)changedObjs.next().getObject();
                			//normally unique
                			//NonLiteral objElement = (NonLiteral)changeGraph.filter(objToChange,LHOntology.element.getProperty(),null).next().getObject();
                			Resource objElement = (Resource)changeGraph.filter(objToChange,LHOntology.element.getProperty(),null).next().getObject();
                			//check if new value
                			Iterator<Triple> newObjList = changeGraph.filter(objToChange,LHOntology.newValue.getProperty(),null);
                			Resource newObj = newObjList.hasNext() ? (Resource)newObjList.next().getObject() : null; 
                			
                			System.out.println("get the object to change");
                			System.out.println(objElement);
                			
                			
                			if(newObj != null){
                				if (newObj.equals(LHOntology.delete.getProperty())){
                					rmFilterTriple.remove(2);
                					rmFilterTriple.add(2,objElement);
                    			}
                				else{
                					rmFilterTriple.remove(2);
                					rmFilterTriple.add(2,objElement);
                					addTriple.remove(2);
                					addTriple.add(2,newObj);
                				}
                			}
                			//if no newSubject, this is a modification of the triple or and addition
                			else{
                				rmFilterTriple.remove(2);
                				rmFilterTriple.add(2,objElement);
                				addTriple.remove(2);
                				addTriple.add(2,objElement);
                			}
                			
                			rmTripleList.add(new TripleImpl((NonLiteral)rmFilterTriple.get(0), (UriRef)rmFilterTriple.get(1), rmFilterTriple.get(2)));
                			
                			//this test prevent from creating blank node
                			//if(!addTriple.contains(null)){
                			//this test is set up for prevent null properties
                			if(!(addTriple.get(1) == null)){
                				addTripleList.add(new TripleImpl((NonLiteral)addTriple.get(0), (UriRef)addTriple.get(1), addTriple.get(2)));
                			}
                			
                			//if no object changed, we want to remove the all object with this property
                			/*if (!changedObjs.hasNext()){
                				rmFilterTriple.add(null);
                			}*/
                			
                			/*
                			//TODO : rework on this if to embrace all cases
                			
                			//if all newObj are null, nothing to change, just add
                			if(newSubject == null && newProp == null && newObj == null){
                				Triple add = new TripleImpl(subjectElement,propElement,objElement);
                    			toAdd.add(add);
                			}
                			//if only newObject is not null, modification of the object
                			if(newSubject == null && newProp == null && newObj != null){
                				Triple rm = new TripleImpl(subjectElement,propElement,objElement);
                    			toRemove.add(rm);
                				Triple add = new TripleImpl(subjectElement,propElement,newObj);
                    			toAdd.add(add);
                			}
                			
                			//if only newPredicate is not null, modification on the predicate
                			if(newSubject == null && newProp != null && newObj == null){
                				Triple rm = new TripleImpl(subjectElement,propElement,objElement);
                    			toRemove.add(rm);
                				Triple add = new TripleImpl(subjectElement,newProp,objElement);
                    			toAdd.add(add);
                			}*/
                			
                			System.out.println("and so new element is.....");
                			
                			//System.out.println(add);
                			
                		}
            			/*** end minimal block **/
            			
            		}
            		gToChange.removeAll(rmTripleList);
            		gToChange.addAll(addTripleList);
        		}		
        		
//        		gToChange.removeAll(toRemove);
//        		gToChange.addAll(toAdd);
        		
        	}
        	
        	
        }
    	return okGraphResponse(headers, gToChange);

    }
    
    @Path("/skosdefinition")
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSkosDefinition(@QueryParam(value = "type") String type, @Context HttpHeaders headers) throws JSONException {
    	
    	JSONObject jo = new JSONObject();
    	JSONArray ja = new JSONArray();
    	
    	if(type.equals("all")){
    		for (SkosEnum e : SkosEnum.values()){
        		ja.put(e.name());
        	}
    	}
    	else if(type.equals("references")){
    		for (SkosReferencesEnum e : SkosReferencesEnum.values()){
        		ja.put(e.name());
        	}
    	}
    	else if(type.equals("properties")){
    		for (SkosPropertiesEnum e : SkosPropertiesEnum.values()){
        		ja.put(e.name());
        	}
    	}
    	else {
    		return Response.status(BAD_REQUEST).build();
    	}
    	
    	jo.put("values", ja);
    	ResponseBuilder rb = Response.ok(jo.toString());
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    /*public List<EnhancementEngine> getActiveEngines() {
        if (skosifier != null) {
            return skosifier.getActiveEngines();
        } else {
            return Collections.emptyList();
        }
    }*/

    /*public static String makeEngineId(EnhancementEngine engine) {
        // TODO: add a property on engines to provided custom local ids and make
        // this static method a method of the interface EnhancementEngine
        String engineClassName = engine.getClass().getSimpleName();
        String suffixToRemove = "EnhancementEngine";
        if (engineClassName.endsWith(suffixToRemove)) {
            engineClassName = engineClassName
                    .substring(0, engineClassName.length() - suffixToRemove.length());
        }
        return engineClassName.toLowerCase();
    }*/

    /**
     * Form-based OpenCalais-compatible interface
     * 
     * TODO: should we parse the OpenCalais paramsXML and find the closest Stanbol Enhancer semantics too?
     * 
     * Note: the format parameter is not part of the official API
     * 
     * @throws EngineException
     *             if the content is somehow corrupted
     * @throws IOException
     */
    //POST
    //Consumes(APPLICATION_FORM_URLENCODED)
    /*public Response enhanceFromForm(@FormParam("content") String content,
                                    @FormParam("format") String format,
                                    @FormParam("ajax") boolean buildAjaxview,
                                    @Context HttpHeaders headers) throws EngineException, IOException {
        log.info("enhance from From: " + content);
        ContentItem ci = new InMemoryContentItem(content.getBytes("UTF-8"), TEXT_PLAIN);
        //TODO : get the config generate
        String jsonConfig = IOUtils.toString(this.getClass().getResourceAsStream("/mapping.json"));
        //
        return enhanceAndBuildResponse(format, headers, ci, jsonConfig, buildAjaxview);
    }*/

    /**
     * Media-Type based handling of the raw POST data.
     * 
     * @param data
     *            binary payload to analyze
     * @param uri
     *            optional URI for the content items (to be used as an identifier in the enhancement graph)
     * @throws EngineException
     *             if the content is somehow corrupted
     * @throws IOException
     */
    //Consumes(WILDCARD)
    
    //public Response enhanceFromData(byte[] data,
    /*public Response enhanceFromData(Map<String, byte[]> map,
                                    @QueryParam(value = "uri") String uri,
                                    @QueryParam(value = "conf") String jsonConfig,
                                    @Context HttpHeaders headers) throws EngineException, IOException {*/
    
  //public Response enhanceFromData(@FormParam(value ="conf") String conf, @FormParam(value = "f") String f,
    
    //combinaison that work
    //Consumes(MULTIPART_FORM_DATA)
    //FormDataParam
    
    //TODO : add parameter(s) for CSV mapping (separator + string delimiter) 
    @POST
    @Consumes(APPLICATION_FORM_URLENCODED)
    public Response enhanceFromData(@FormParam(value ="conf") String jsonConfig, 
    								@FormParam(value = "file") String f,
    								@Context HttpHeaders headers) throws EngineException, IOException {
        
    	String format = TEXT_PLAIN;
        if (headers.getMediaType() != null) {
            format = headers.getMediaType().toString();
        }
        
        //TO REMOVE
        //String uri = null;
        
        //ContentItem ci = new InMemoryContentItem(uri, "TEST".getBytes(), format);
        return enhanceAndBuildResponse(null, headers, jsonConfig, f, false);
    }

    protected Response enhanceAndBuildResponse(String format,
                                               HttpHeaders headers,
                                               //ContentItem ci,
                                               String jsonConfig,
                                               String data,
                                               boolean buildAjaxview) throws EngineException, IOException{
    	System.out.println("Dans le build responses");
    	/** variables to get */
    	//String jsonConfig = IOUtils.toString(this.getClass().getResourceAsStream("/mapping.json"));
    	//InputStream inputStream = this.getClass().getResourceAsStream("/horn1.csv");
    	InputStream inputStream = IOUtils.toInputStream(data);
    	String delim = "	";
    	/** end variable to get */
    	MGraph graph = null;
    	if (skosifier != null) {
    		try {
				graph = skosifier.skosify(delim.charAt(0), inputStream, jsonConfig);
			} catch (JSONException e) {
				throw new WebApplicationException(e, BAD_REQUEST);
			}
        }
    	
    	UriRef thRef = skosifier.getGraphName();
    	
    	ResponseBuilder rb = Response.ok("<a rel='job' href='"+thRef.getUnicodeString()+"'>Browse your thesaurus</a>").type("text/xml");
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    private Response okGraphResponse(HttpHeaders headers, MGraph graph){
    	ResponseBuilder rb = Response.ok(graph);
        if (headers.getAcceptableMediaTypes().isEmpty()) {
            // use RDF/XML as default format to keep compat with OpenCalaisclients
            System.out.println("NO ACCEPTABLE MEDIA TYPE");
            rb.header(HttpHeaders.CONTENT_TYPE, RDF_XML+"; charset=UTF-8");
        }
        
        addCORSOrigin(servletContext,rb, headers);
        return rb.build();
    }
}
