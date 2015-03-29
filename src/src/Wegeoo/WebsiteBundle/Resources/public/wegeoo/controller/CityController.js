///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONSTRUCTOR
Wegeoo.CityController = function()
{
    this.mFilterIndex = 0;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// GET TOWNS
Wegeoo.CityController.prototype.filterTowns = function(parameters,callback)
{
    setTimeout(this.doFilterTowns.bind(this),500,parameters,callback , ++this.mFilterIndex);
};
Wegeoo.CityController.prototype.doFilterTowns = function(parameters,callback,filterIndex)
{
    if ( filterIndex != this.mFilterIndex ) return;

    if (parameters instanceof Object)
    {
        var lServiceParameters = {};
        lServiceParameters["filters"] = parameters;

        var lService = new Wegeoo.Service();
        lService.get(Wegeoo.Service.ROUTE_CITY , lServiceParameters , callback);
    }else{
        console.error("parameters must be an array.");
    }

    this.newFilter = false;
    this.checkOtherFilter = false;
}
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////