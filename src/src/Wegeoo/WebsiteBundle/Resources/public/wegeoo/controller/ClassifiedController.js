///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONSTRUCTOR
Wegeoo.ClassifiedController = function()
{

};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// LOAD LATEST CLASSIFIEDS
Wegeoo.ClassifiedController.prototype.loadLatestClassifieds = function(parameters, callback)
{
    if (parameters instanceof Object)
    {
        parameters.filterType = "getLatestAround";

        var lServiceParameters = {};
        lServiceParameters["filters"] = parameters;

        var lService = new Wegeoo.Service();
        //lService.addEventListener(Wegeoo.ServiceEvent.COMPLETE , this.onClassifiedSearchedComplete.bind(this));
        lService.get(Wegeoo.Service.ROUTE_CLASSIFIEDS , lServiceParameters , callback);
    }else{
        console.error("parameters must be an array.");
    }
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTACT ADVERTISER
Wegeoo.ClassifiedController.prototype.searchClassifieds = function(parameters, callback)
{
    if (parameters instanceof Object)
    {
        parameters.filterType = "getGeolocation";

        var lServiceParameters = {};
        lServiceParameters["filters"] = parameters;

        var lService = new Wegeoo.Service();
        lService.addEventListener(Wegeoo.ServiceEvent.COMPLETE , this.onClassifiedSearchedComplete.bind(this));
        lService.get(Wegeoo.Service.ROUTE_CLASSIFIEDS , lServiceParameters , callback);
    }else{
        console.error("parameters must be an array.");
    }
};
Wegeoo.ClassifiedController.prototype.onClassifiedSearchedComplete = function(event)
{
    event.getTarget().addEventListener(Wegeoo.ServiceEvent.COMPLETE , this.onClassifiedSearchedComplete.bind(this));
    Wegeoo.FrontController.getInstance().dispatchEvent(new Wegeoo.WegeooEvent(Wegeoo.WegeooEvent.SEARCH_CLASSIFIEDS_COMPLETE , event.getData()));
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTACT ADVERTISER
Wegeoo.ClassifiedController.prototype.contactAdvertiser = function(parameters)
{
    var lService = new Wegeoo.Service();
    lService.addEventListener(Wegeoo.ServiceEvent.COMPLETE  , this.onAdvertiserContacted.bind(this));
    lService.addEventListener(Wegeoo.ServiceEvent.ERROR     , this.onAdvertiserContacted.bind(this));
    lService.patch(Wegeoo.Service.ROUTE_CLASSIFIEDS , parameters["reference"] , parameters);
};
Wegeoo.ClassifiedController.prototype.onAdvertiserContacted = function(event)
{
    if ( event)
    {
        event.getTarget().removeEventListener(Wegeoo.ServiceEvent.COMPLETE , this.onAdvertiserContacted.bind(this));
        event.getTarget().removeEventListener(Wegeoo.ServiceEvent.ERROR , this.onAdvertiserContacted.bind(this));

        var lWegeooEvent = null;
        if ( event.getName() == Wegeoo.ServiceEvent.COMPLETE)
        {
            lWegeooEvent = new Wegeoo.WegeooEvent(Wegeoo.WegeooEvent.USER_ACTION_COMPLETE , event.getData());
        }else if ( event.getName() == Wegeoo.ServiceEvent.ERROR)
        {
            lWegeooEvent = new Wegeoo.WegeooEvent(Wegeoo.WegeooEvent.USER_ACTION_ERROR , event.getData());
        }
        Wegeoo.FrontController.getInstance().dispatchEvent(lWegeooEvent);
    }else{
        console.error("The callback 'onAdvertiserContacted' does not have any event");
    }
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// ON SEARCH COMPLETE