///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONSTRUCTOR
Wegeoo.StorageController = function()
{
};
Wegeoo.StorageController.SORT_BY = "sortBy";
Wegeoo.StorageController.CATEGORY = "category";
Wegeoo.StorageController.TOWN_INFOS = "townInfos";

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SESSION STORAGE
Wegeoo.StorageController.prototype.storeSessionData = function(pKey , pValue)
{
    if ( this.isAvailable())
    {
       sessionStorage.setItem(pKey , pValue);
    }
    
};
Wegeoo.StorageController.prototype.getSessionData = function(pKey)
{
    if ( this.isAvailable())
    {
       return sessionStorage.getItem(pKey);
    }
    return null;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// LOCAL STORAGE
Wegeoo.StorageController.prototype.storeLocalData = function(pKey , pValue)
{
    if ( this.isAvailable())
    {
       localStorage.setItem(pKey , pValue);
    }
    
};
Wegeoo.StorageController.prototype.getLocalData = function(pKey)
{
    if ( this.isAvailable())
    {
       return localStorage.getItem(pKey);
    }
    return null;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// AVAILABILITY
Wegeoo.StorageController.prototype.isAvailable = function()
{
    return typeof(Storage) !== "undefined";
};