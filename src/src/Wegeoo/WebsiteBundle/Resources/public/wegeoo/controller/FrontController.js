///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTRUCTOR
Wegeoo.FrontController = function()
{
    this.mEventsCallback        = [];
    this.mSelectedReferences    = [];
    this.mSearchProperties      = [];
    this.mPageViewController        = null;
    this.mLocaleManager             = new Wegeoo.LocaleManager();
    /** Some references are stored to be user-friendly website */
    this.mStorageController         = new Wegeoo.StorageController();
    /** Manage the root and call some webservices if needed */
    this.mRouteController           = new Wegeoo.RouteController();
    /** All city actions ( search... )*/
    this.mCityController            = new Wegeoo.CityController();
    /** All classified actions ( get, patch, search, contactAdvertiser ... ) */
    this.mClassifiedController      = new Wegeoo.ClassifiedController();

    //set lang
    this.mLocaleManager.setLang("fr_FR");

   // this.listenPopStateEvent()
};
Wegeoo.FrontController.instance;
Wegeoo.FrontController.getInstance = function()
{
    if (Wegeoo.FrontController.instance == undefined)
        Wegeoo.FrontController.instance = new Wegeoo.FrontController();

    return Wegeoo.FrontController.instance;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// INIT
Wegeoo.FrontController.prototype.addString = function(key, value)
{
    this.mLocaleManager.addString(key,value);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// INIT ( A VIRER )
Wegeoo.FrontController.prototype.setPageViewController = function(pPageViewController)
{
    this.mPageViewController = pPageViewController;
    this.mPageViewController.init();
};
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////// REGISTER PROPERTY
Wegeoo.FrontController.prototype.registerSearchProperty = function(pPropertyName, type)
{
    this.mSearchProperties[pPropertyName] = type;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CLASSIFIED SERVICES
Wegeoo.FrontController.prototype.searchClassifieds = function(parameters, callback)
{
    this.mClassifiedController.searchClassifieds(parameters, callback);
};
Wegeoo.FrontController.prototype.contactAdvertiser = function(parameters)
{
    this.mClassifiedController.contactAdvertiser(parameters);
};

Wegeoo.FrontController.prototype.loadLatestClassifieds = function(parameters,callback)
{
    this.mClassifiedController.loadLatestClassifieds(parameters,callback);
};

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CITY SERVICES
Wegeoo.FrontController.prototype.filterTowns = function(parameters , callback)
{
    this.mCityController.filterTowns(parameters,callback);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// UPDATE STATE
Wegeoo.FrontController.prototype.updateStateFromPage = function()
{
    this.mRouteController.updateStateFromPage();
};
Wegeoo.FrontController.prototype.updatePageFromState = function()
{
    this.mRouteController.updatePageFromState();
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// ROUTE
Wegeoo.FrontController.prototype.addRoute = function(path)
{
    return this.mRouteController.addRoute(path);
};
Wegeoo.FrontController.prototype.getSlugValue = function(slugName)
{
    return this.mRouteController.getSlugValue(slugName);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SET STATE

Wegeoo.FrontController.prototype.pushState = function(value)
{
    this.mRouteController.pushState(value);
};
//Wegeoo.FrontController.prototype.registerStateParserFunction = function(value)
//{
//    this.mRouteController.registerStateParserFunction(value);
//};
//Wegeoo.FrontController.prototype.registerStateCreatorFunction = function(value)
//{
//    this.mRouteController.registerStateCreatorFunction(value);
//};
//Wegeoo.FrontController.prototype.getStateCreatorFunction = function()
//{
//    return this.mRouteController.getStateCreatorFunction();
//};
//Wegeoo.FrontController.prototype.getStateParserFunction = function()
//{
//    return this.mRouteController.getStateParserFunction();
//};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// DATA STORAGE 
Wegeoo.FrontController.prototype.storeSessionData = function(key , value)
{
    this.mStorageController.storeSessionData(key , value);
};
Wegeoo.FrontController.prototype.getSessionData = function(key)
{
    return this.mStorageController.getSessionData(key);
};
Wegeoo.FrontController.prototype.storeLocalData = function(key , value)
{
    this.mStorageController.storeLocalData(key , value);
};
Wegeoo.FrontController.prototype.getLocalData = function(key)
{
    return this.mStorageController.getLocalData(key);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SCROLL
Wegeoo.FrontController.prototype.scrollTo = function(object, pOffsetY)
{
    var lPositionY = object.offset().top + pOffsetY;
    this.scrollToPosition(lPositionY);
};
Wegeoo.FrontController.prototype.scrollToPosition = function(pY)
{
    $('html,body').animate({
        "scrollTop" : pY
    }, {
        duration : 400,
        easing : "swing"
    });
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// MARKERS
Wegeoo.FrontController.prototype.displayMarkers = function(markersInfo)
{
    this.dispatchEvent(new Wegeoo.WegeooEvent(Wegeoo.WegeooEvent.MARKERS_CHANGED, markersInfo));

    //scroll to the map
    this.scrollTo($("#mapLayout"), 0);
};
Wegeoo.FrontController.prototype.highlightMarker = function(pReference)
{
    if ( this.mPageViewController )
        this.mPageViewController.highlightMarker(pReference);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SET SELECTED GOOGLE MARKERS
Wegeoo.FrontController.prototype.setSelectedReferences = function(references)
{
    if (references) {
        this.mSelectedReferences = references;
        this.dispatchEvent(new Wegeoo.WegeooEvent(Wegeoo.WegeooEvent.MARKERS_SELECTION_CHANGED, references));
    } else {
        //@Error
    }
};
Wegeoo.FrontController.prototype.getSelectedReferences = function()
{
    return this.mSelectedReferences;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SET SEARCH
//Wegeoo.FrontController.prototype.registerSearchTownData = function(pTownData)
//{
//    this.mSearchController.registerSearchTownData(pTownData);
//};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SEARCH
//Wegeoo.FrontController.prototype.search = function(pFilters)
//{
//    this.mSearchController.filterClassifieds(pFilters);
//};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// POPUP
Wegeoo.FrontController.prototype.displayPopup = function(pPopupName, pAnnonceReference)
{
    this.mPopupController.displayPopup(pPopupName, pAnnonceReference);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// DELETE ANNOUNCEMENT
Wegeoo.FrontController.prototype.warnAnnouncement = function(pAnnonceReference, pName, pEmail, pDescription, pCaptcha)
{
    this.mAnnouncementController.warnAnnouncement(pAnnonceReference, pName, pEmail, pDescription, pCaptcha);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// DELETE ANNOUNCEMENT
Wegeoo.FrontController.prototype.deleteAnnouncement = function(pAnnonceReference, pCategoryId, pPassword, pCaptcha)
{
    this.mAnnouncementController.deleteAnnouncement(pAnnonceReference, pCategoryId, pPassword, pCaptcha);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// DELETE ANNOUNCEMENT
Wegeoo.FrontController.prototype.recoverPassword = function(pAnnonceReference, pEmail)
{
    this.mAnnouncementController.recoverPassword(pAnnonceReference, pEmail);
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// VALIDATE PAYMENT
Wegeoo.FrontController.prototype.validPayment = function(pAnnonceReference)
{
    alert("TODO");
    //this.mAnnouncementController.deleteAnnouncement(pAnnonceReference,pCategoryId,pPassword,pCaptcha)
};
Wegeoo.FrontController.prototype.sendSMSCode = function(pAnnonceReference)
{
    alert("TODO");
    //this.mAnnouncementController.deleteAnnouncement(pAnnonceReference,pCategoryId,pPassword,pCaptcha)
};
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// LOCALE
Wegeoo.FrontController.prototype.getString = function(pString)
{
    return this.mLocaleManager.getString(pString);
};
Wegeoo.FrontController.prototype.getReverso = function(pString)
{
    return this.mLocaleManager.getReverso(pString);
};
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// EVENTS
Wegeoo.FrontController.prototype.addEventListener = function(pEventName, pEventCallback)
{
    this.mEventsCallback[pEventName] = pEventCallback;
};
Wegeoo.FrontController.prototype.removeEventListener = function(pEventName, pEventCallback)
{
    delete this.mEventsCallback[pEventName];
};
Wegeoo.FrontController.prototype.dispatchEvent = function(pEvent)
{
    //set target
    pEvent.setTarget(this);

    var lEventName = pEvent.getName();

    if (this.mEventsCallback[lEventName])
        this.mEventsCallback[lEventName].call(null, pEvent);
};
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////  GETTER
Wegeoo.FrontController.prototype.getPopupController = function()
{
    return this.mPopupController;
};
