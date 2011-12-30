package eu.lh.skosifier.api;

import java.io.IOException;
import java.io.InputStream;

import org.apache.clerezza.rdf.core.MGraph;
import org.codehaus.jettison.json.JSONException;

public interface Skosifier {
	public MGraph skosify(Character delim, InputStream inputStream, String jsonConfig ) throws IOException, JSONException;
}
