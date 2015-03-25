/**
 * Created by Pierre on 10/12/14.
 */
/**
 *
 * @param selector A string containing a selector expression to match elements against.
 * @param getterFunctionName string May be method, method()
 * @param setterFunctionName string May be method, method(%s) , method([%s])
 * @param getterWebserviceFunctionName string May be method, method()
 * @constructor
 */
Wegeoo.SlugView = function(selector , getterFunctionName, setterFunctionName,getterWebserviceFunctionName)
{
    this.mSelector             = selector;
    this.mGetterFunctionName   = getterFunctionName;
    this.mSetterFunctionName   = setterFunctionName;
    this.mGetterWebserviceFunctionName   = getterWebserviceFunctionName;
};
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
Wegeoo.SlugView.prototype.getSelector = function()
{
    return this.mSelector;
};
Wegeoo.SlugView.prototype.getGetterFunctionName = function()
{
    return this.mGetterFunctionName;
};
Wegeoo.SlugView.prototype.getSetterFunctionName = function()
{
    return this.mSetterFunctionName;
};
Wegeoo.SlugView.prototype.getGetterWebserviceFunctionName = function()
{
    return this.mGetterWebserviceFunctionName || this.mGetterFunctionName;
};