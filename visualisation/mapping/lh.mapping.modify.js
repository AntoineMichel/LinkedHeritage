(function(){
	
	//TODO : create this own "object" for this function and remove duplication from mapping.js
	/*function langSelector(selectNode, langArray, changeFunc){
		$(selectNode).html(function(){
			res = "";
			langArray.forEach(function(v, i) {
				res += "<option value=" + v + ">" + v + "</option>";
			});
			return res;
		});
		$(selectNode).change(changeFunc);
	}*/
	
	//check if value have changed
	function isValueChanged(o,p,d,l){
		
		if(o == lh.sem.getPropValue(p,d,l)) return false;
		if ((o=="") && (lh.sem.getPropValue(p,d,l) == null)) return false;
		
		return true;
		
	}
	
	//lh = {};
	lh.modify = {};
	var changes;
	var node;

	lh.modify.buildDialog = function(d){
		node = d;
		//init the changes object
		changes = {};
		changes.values = [];
		
		//d.updatedTriples = {};
		function createField(val){
			res = $("<textarea rows='1' />");
			//attributes to identify the field
			$(res).attr("predicate",val);
			$(res).attr("language",d.ingraph.curLang);
			data = lh.sem.getPropValue(val, d);
			data ? $(res).val(data) : $(res).attr("placeholder","Value not set for this language");
			/* workaround for https://github.com/padolsey/jQuery.fn.autoResize/issues/35
			 * see tabs for 1st part of workaround
			 */
			$(res).focus(function(d,i){
					$(this).autoResize({
						extraSpace : 5,
						minHeight : "original",
					});
				});
			
			$(res).focusout(function(){
				o = $(this).val(); 
				p = $(this).attr("predicate");
				l = $(this).attr("language");
				//if value changed
				//if(o != lh.sem.getPropValue(p,d,l)){
				if(isValueChanged(o,p,d,l)){
					//new atomic change
					c = {};
					c.crud = "u";
					c.subject = d["@subject"];
					c.predicate = p;
					
					//changes.push([p,o,l, Date.now()]);
					modif = lh.sem.setPropValue(d,p,o,l);
					
					c.object = modif;
					c.date = Date.now();
					c.user ="defaultUser";
					changes.values.push(c);
				} 
			});
			
			return res;
		}
		
		lh.utils.langSelector( $("#modifyLang"), d.ingraph.langArray,
				function(){
					var lang = this.options[this.selectedIndex].value; 
					$( "#dialog-form textarea" ).each(function(n){
						$(this).attr("language",lang);
						val = lh.sem.getPropValue($(this).attr("predicate"),d, lang);
						
						val ? $(this).val(val) : $(this).val("");
					});
		});
		
		ulTabs = 
			'<ul>'+
			'</ul>' ;
		divs =
			'<div id="tabs">' +
			'</div>';
		
		var a = skosOnto.getValues();
		txt = "";
		a.forEach(function(val){ 
			if(d[val]){
				ulTabs = $(ulTabs).append('<li><a href="#tabs-'+val+'">'+val+'</a></li>');
				
				divs = $(divs).append($('<div id="tabs-'+val+'"> </div>').append(createField(val)));
			} 
			});
			
		divs = $(divs).prepend(ulTabs);
		
		$( "#dialog-form #tabZone" ).empty();
		$( "#dialog-form #tabZone" ).append(divs);
		
		$("#tabs").tabs({
			selected : 0,
			/* workaround for https://github.com/padolsey/jQuery.fn.autoResize/issues/35
			 * see the focus event for 2 workaround part 
			 */
			show: function(event, ui) {
				$(ui.panel).children("textarea").trigger("focus");
			}
		});
		
	};
	
	lh.modify.save = function(){
		alert(JSON.stringify(changes));
		return d;
	}
		
	lh.modify.revertChanges = function(){
		changes.values.reverse().forEach(function(c){
			//TODO : get setpropValue get directly the c.object[0] ==> create a js litteral(factory)
			lh.sem.setPropValue(node,c.predicate,c.object[0]["@literal"],c.object[0]["@language"]);
			test = "";
		});
	};
	
	lh.modify.cancel = function(){
		lh.modify.revertChanges();
		return node;
	}
	
})();