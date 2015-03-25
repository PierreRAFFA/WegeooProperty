/**
 * Wegeoo Namespace
 * @type {Object}
 */
var Wegeoo = Wegeoo || {};


/**
 * Used to access and/or create subnamespaces in Wegeoo
 * 
 * @param namespace : String of the form namespace.subnameSpace
 * @return {Object} : The targeted name space in Wegeoo
 */
Wegeoo.ns = function(namespace)
{
	var a = namespace.split(".");
	var obj = Wegeoo;
	for(var i=0 , len= a.length ; i<len ; i++){
		var key = a[i];
		if(!obj[key]){
			obj[key] = {};
		}
		obj = obj[key];
	}
	return obj;
};