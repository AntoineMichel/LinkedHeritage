function getURLargs() {
		var args = document.location.search.substring(1).split(/\&/);
		//alert(JSON.stringify(args));
		argsParsed = {};

		for (i = 0; i < args.length; i++) {
			arg = unescape(args[i]);

			if (arg.indexOf('=') == -1) {
				argsParsed[arg.trim()] = true;
			} else {
				kvp = arg.split('=');
				argsParsed[kvp[0].trim()] = kvp[1].trim();
			}
		}
		return argsParsed;
	}

function gethost(){
	alert("getHost");
	var loc = location.href;
}