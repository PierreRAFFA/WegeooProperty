/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTRCUTOR
Wegeoo.WegeooEvent = function(pEventName , pEventData)
{
	this.mName 		= pEventName;
	this.mData 		= pEventData;
	this.mTarget 	= null;
};

Wegeoo.WegeooEvent.SEARCH_CLASSIFIEDS_COMPLETE    = "WegeooEventSearchClassifiedsComplete";
Wegeoo.WegeooEvent.PREVIEW_CLASSIFIED_MOUSE_OVER  = "WegeooEventPreviewClassifiedMouseOver";
Wegeoo.WegeooEvent.PREVIEW_CLASSIFIED_MOUSE_OUT   = "WegeooEventPreviewClassifiedMouseOut";

Wegeoo.WegeooEvent.USER_ACTION_COMPLETE           = "WegeooEventUserActionComplete";
Wegeoo.WegeooEvent.USER_ACTION_ERROR              = "WegeooEventUserActionError";

Wegeoo.WegeooEvent.MARKERS_CHANGED                = "WegeooEventMarkersChanged";
Wegeoo.WegeooEvent.MARKERS_SELECTION_CHANGED      = "WegeooEventMarkersSelectionChanged";
Wegeoo.WegeooEvent.STATE_CHANGED                  = "WegeooEventStateChanged";



Wegeoo.WegeooEvent.prototype.setTarget = function(pValue)	{ this.mTarget = pValue; };
Wegeoo.WegeooEvent.prototype.getTarget = function()		{ return this.mTarget; };

Wegeoo.WegeooEvent.prototype.getName = function()		{ return this.mName; };
Wegeoo.WegeooEvent.prototype.getData = function()		{ return this.mData; };