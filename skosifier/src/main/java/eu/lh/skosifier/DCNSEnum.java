package eu.lh.skosifier;

public enum DCNSEnum{
	
	/**
	 * TODO : add the dcelement NS to stabol namespaceEnum
	 */
	
    dcElements("http://purl.org/dc/elements/1.1/");

    String ns;
    String prefix;

    DCNSEnum(String ns) {
        if (ns == null) {
            throw new IllegalArgumentException("The namespace MUST NOT be NULL");
        }
        this.ns = ns;
    }

    DCNSEnum(String prefix, String ns) {
        this(ns);
        this.prefix = prefix;
    }

    public String getNamespace() {
        return ns;
    }

    public String getPrefix() {
        return prefix == null ? name() : prefix;
    }

    @Override
    public String toString() {
        // TODO Auto-generated method stub
        return ns;
    }
}
