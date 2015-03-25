/////////////////////////////////////////////////////////////////////////////////////////
///////////
///////////  Service Class
///////////
///////////
///////////
///////////
/////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.Service = function()
{
    this.mEventsCallback = new Array();

};
Wegeoo.Service.BASE_URL = "";
Wegeoo.Service.ROUTE_CITY                   = "/api/v1/cities";
Wegeoo.Service.ROUTE_CLASSIFIEDS            = "/api/v1/classifieds";
Wegeoo.Service.ROUTE_PREVIEW_CLASSIFIEDS    = "/api/v1/previewclassifieds";
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// SEND REQUEST
Wegeoo.Service.prototype.get = function(pRoute,pParameters , onCallback)
{
    var lJSONParameters = "";
    for(var lKey in pParameters)
    {
        lJSONParameters += (lJSONParameters=="" ? "" : "&") + lKey + "=" + JSON.stringify(pParameters[lKey]);
    }
    var lRestURL = Wegeoo.Service.BASE_URL + pRoute;
    this.send(lRestURL,"GET",lJSONParameters,onCallback);
};
Wegeoo.Service.prototype.post = function(pRoute,pReference,pParameters)
{
    var lRestURL = Wegeoo.Service.BASE_URL + pRoute + "/" + pReference;
	this.send(lRestURL,"POST",pParameters)
};
Wegeoo.Service.prototype.patch = function(pRoute,pReference,pParameters)
{
    var lRestURL = Wegeoo.Service.BASE_URL + pRoute + "/" + pReference;
    this.send(lRestURL,"PATCH",pParameters)
};
Wegeoo.Service.prototype.send = function(pRestURL,pType,pParameters,onCallback)
{
    var lThis = this;

    //stringify parameters
    var lParameters = pParameters;
    if ( lParameters && lParameters instanceof Object)
        lParameters = JSON.stringify(lParameters);

    //lParameters is null if "GET"
    $.ajax({
        url: pRestURL,
        type: pType,
        data:lParameters,
        contentType: "application/json; charset=utf-8",
        success: function (data, status, jqXHR)
        {
            var lSuccessEvent = new Wegeoo.ServiceEvent(Wegeoo.ServiceEvent.COMPLETE, data);
            lThis.dispatchEvent(lSuccessEvent);
            if ( onCallback)
                onCallback.call(null,lSuccessEvent);
        },

        error: function (jqXHR, status) {
            var lError = {};
            lError.jqXHR = jqXHR;
            lError.status = status;

            var lErrorEvent = new Wegeoo.ServiceEvent(Wegeoo.ServiceEvent.ERROR, lError);
            lThis.dispatchEvent(lErrorEvent);
            if ( onCallback)
                onCallback.call(null,lErrorEvent);

            console.log(status + " " + jqXHR);
        }
    });
}
Wegeoo.Service.prototype.sendRequest = function(pOperation, pParams)
{

    //create http request
    lHttpRequest = this.createHttpRequest();

    if (lHttpRequest) {
        //get num slashes
        var lHostNumSlashes = Wegeoo.StringUtils.substrCount(window.location.href, "/");

        //remove 2 useless slahes
        lHostNumSlashes -= 2;
        //alert(lHostNumSlashes);

        //change to relative path
        var lServiceRelativePath = "";
        for ( iSlash = 0; iSlash < lHostNumSlashes; iSlash++) {
            lServiceRelativePath += "../";
        }
        lServiceRelativePath += this.mServiceFile;
        //alert(lServiceRelativePath);

        //get data
        var lData = "operation=" + pOperation;
        for (lKey in pParams) {
            $lParamString = "&" + lKey + "=" + pParams[lKey];
            lData += $lParamString;
        }

        var lThis = this;
        lHttpRequest.onreadystatechange = function()
        {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var lResponse = this.responseText;

                    //operation "getClassifiedAdListView" returns an html content, so no need to parse to json
                    if (pOperation != "getClassifiedAdListView")
                        lResponse = JSON.parse(lResponse);

                    lThis.dispatchEvent(new Wegeoo.ServiceEvent(Wegeoo.ServiceEvent.COMPLETE, lResponse));
                }
            }
        };
        lHttpRequest.open("POST", this.mServiceFile, true);
        lHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        lHttpRequest.send(lData);

    }
};
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// UPLOAD FILE
Wegeoo.Service.prototype.upload = function(pOperation, pParams)
{
    //create http request
    lHttpRequest = this.createHttpRequest();

    if (lHttpRequest) {
        //get form data
        var lData = new FormData();
        lData.append("operation", pOperation);
        for (lKey in pParams) {
            lData.append(lKey, pParams[lKey]);
        }

        var lThis = this;
        lHttpRequest.upload.addEventListener("progress", this.onUploadProgress.bind(this), false);
        lHttpRequest.onreadystatechange = function()
        {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    lThis.dispatchEvent(new Wegeoo.ServiceEvent(Wegeoo.ServiceEvent.COMPLETE, null));
                } else {
                    var vResponse = this.responseText;
                    lThis.dispatchEvent(new Wegeoo.ServiceEvent(Wegeoo.ServiceEvent.ERROR, vResponse));
                }
            }
        };
        lHttpRequest.open("POST", this.mServiceFile);
        lHttpRequest.send(lData);

    }
};
Wegeoo.Service.prototype.onUploadProgress = function()
{
    this.dispatchEvent(new Wegeoo.ServiceEvent(Wegeoo.ServiceEvent.PROGRESS, null));
};
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// CREATE HTTP REQUEST
Wegeoo.Service.prototype.createHttpRequest = function()
{
    var lHttpRequest;
    try {
        lHttpRequest = new XMLHttpRequest();
        //Geko
    } catch(trymicrosoft) {
        try {
            lHttpRequest = new ActiveXObject('Msxml2.XMLHTTP');
            //MS 1
        } catch (othermicrosoft) {
            try {
                lHttpRequest = new ActiveXObject('Microsoft.XMLHTTP');
                //MS 2
            } catch (failed) {
                lHttpRequest = false;
            }
        }
    }
    return lHttpRequest;
};
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// EVENTS
Wegeoo.Service.prototype.addEventListener = function(pEventName, pEventCallback)
{
    //@TODO Carefull some events should have multiple callbacks.
    this.mEventsCallback[pEventName] = pEventCallback;
};

Wegeoo.Service.prototype.removeEventListener = function(pEventName, pEventCallback)
{
    delete this.mEventsCallback[pEventName];
};

Wegeoo.Service.prototype.dispatchEvent = function(pEvent)
{
    //set target
    pEvent.setTarget(this);

    lEventName = pEvent.getName();

    if (this.mEventsCallback[lEventName])
        this.mEventsCallback[lEventName].call(null, pEvent);
};

/////////////////////////////////////////////////////////////////////////////////////////
///////////
///////////  Event Class
///////////
///////////
///////////
///////////
/////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.ServiceEvent = function(pEventName, pEventData)
{
    this.mName = pEventName;
    this.mData = pEventData;
    this.mTarget = null;
};

Wegeoo.ServiceEvent.COMPLETE 	= "complete";
Wegeoo.ServiceEvent.PROGRESS 	= "progress";
Wegeoo.ServiceEvent.ERROR 		= "error";

Wegeoo.ServiceEvent.prototype.setTarget = function(pValue)
{
    this.mTarget = pValue;
};
Wegeoo.ServiceEvent.prototype.getTarget = function()
{
    return this.mTarget;
};

Wegeoo.ServiceEvent.prototype.getName = function()
{
    return this.mName;
};
Wegeoo.ServiceEvent.prototype.getData = function()
{
    return this.mData;
};

