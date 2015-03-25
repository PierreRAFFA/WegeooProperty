/**
 * A refaire
**/
function WegeooMap()
{
	this.mGoogleMap = null;
	this.mEditionMarker = null;
	this.mGoogleMarkers = [];
	this.mGoogleMarkersDico = {};
	this.mEvents = [];
	this.mReferences = [];
	this.mMarkerCluster = null;
	this.mSelectedCluster = null;
	this.mEnableSelection = true;
    this.mExternalLatitudeInput = null;
    this.mExternalLongitudeInput = null;

}

WegeooMap.prototype.create = function(inMapId)
{
	var lHTMLElement 		= $("#map_canvas");
	var lMarkerLongitude 	= $(lHTMLElement).attr("markerLongitude");
	var lMarkerLatitude 	= $(lHTMLElement).attr("markerLatitude");
	var lMapLongitude 		= $(lHTMLElement).attr("mapLongitude") || lMarkerLongitude || 43.60;
	var lMapLatitude 		= $(lHTMLElement).attr("mapLatitude") || lMarkerLatitude || 3.87;
	var lEnableSelection 	= $(lHTMLElement).attr("enableSelection") != "false";

	this.mEnableSelection = lEnableSelection;

	var center = new google.maps.LatLng(lMapLongitude,lMapLatitude);
	this.mGoogleMap = new google.maps.Map(document.getElementById(inMapId), 
    {
      	zoom: 12,
      	center:center,
      	mapTypeId: google.maps.MapTypeId.ROADMAP,
      	mapTypeControl: true,
    	disableDefaultUI: true,
	    zoomControl: true,
	    scrollwheel:false,
	    zoomControlOptions: {
	      style: google.maps.ZoomControlStyle.SMALL
	    }
      	
    });

    if ( lMarkerLongitude && lMarkerLatitude)
    {
    	var lMarker = {};
    	lMarker.longitude = lMarkerLongitude;
    	lMarker.latitude = lMarkerLatitude;

    	var lMarkers = {};
    	lMarkers["classifieds"] = [lMarker]
    	this.displayMarkers(lMarkers);
    }
    // Try W3C Geolocation (Preferred)
    return;
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      this.mGoogleMap.setCenter(initialLocation);
      alert("1");
    }, function() {
      handleNoGeolocation(browserSupportFlag);alert("2");
    });
  // Try Google Gears Geolocation
  } else if (google.gears) {
    browserSupportFlag = true;
    var geo = google.gears.factory.create('beta.geolocation');
    geo.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.latitude,position.longitude);
       this.mGoogleMap.setCenter(initialLocation);
    }, function() {
      handleNoGeoLocation(browserSupportFlag);
    });
  // Browser doesn't support Geolocation
  } else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }
  
  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      alert("Geolocation service failed.");
      initialLocation = newyork;
    } else {
      alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
      initialLocation = siberia;
    }
     this.mGoogleMap.setCenter(initialLocation);
  }
};
WegeooMap.prototype.clear = function()
{
	this.mMarkerCluster && this.mMarkerCluster.clearMarkers();
	this.mMarkerCluster = null;
	this.mGoogleMarkers = [];
	this.mGoogleMarkersDico = {};
};
WegeooMap.prototype.geocode = function(inSearch , inZoom, inAddMarker)
{
	var self = this;
	var vMap = this.mGoogleMap;
	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': inSearch}, function(results, status) 
	{
		if (status == google.maps.GeocoderStatus.OK) 
		{
			vMap.setCenter(results[0].geometry.location);
        	inZoom && vMap.setZoom(inZoom);
        	
        	if ( inAddMarker )
        	{
    			self.addEditionMarker(results[0].geometry.location.k , results[0].geometry.location.B);
        	}
      	} else {	
        	alert("Geocode was not successful for the following reason: " + status);
      	}
    });
};
WegeooMap.prototype.geocodeAndDisplayMarkers = function(inSearch , inZoom, inMarkers)
{
	var lThis = this;
	var vMap = this.mGoogleMap;
	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': inSearch}, function(results, status) 
	{
		if (status == google.maps.GeocoderStatus.OK) 
		{
			vMap.setCenter(results[0].geometry.location);
        	inZoom && vMap.setZoom(inZoom);
        	
        	if ( inMarkers )
        	{
    			lThis.displayMarkers(inMarkers);
        	}
      	} else {
        	alert("Geocode was not successful for the following reason: " + status);
      	}
    });
};
WegeooMap.prototype.addEditionMarker = function(inLatitude, inLongitude)
{
    var lLatLng = new google.maps.LatLng(inLatitude,inLongitude);

	if ( this.mEditionMarker == null) {
        //create marker
        this.mEditionMarker = new google.maps.Marker({
            map: this.mGoogleMap,
            draggable: true,
            position: lLatLng
        });

        //add event
        var lThis = this;
        google.maps.event.addListener(this.mEditionMarker, 'dragend', function (event) {
            if (lThis.mExternalLatitudeInput)
                lThis.mExternalLatitudeInput.val(event.latLng.k)

            if (lThis.mExternalLongitudeInput)
                lThis.mExternalLongitudeInput.val(event.latLng.B);
        });

    }else {
        this.mEditionMarker.setPosition(lLatLng);
    }


    if ( this.mExternalLatitudeInput)
        this.mExternalLatitudeInput.val(inLatitude)

    if ( this.mExternalLongitudeInput)
        this.mExternalLongitudeInput.val(inLongitude);

    this.mGoogleMap.setCenter(lLatLng);
    this.mGoogleMap.setZoom(16);
};
WegeooMap.prototype.getEditionMarkerPosition = function ()
{
	if ( this.mEditionMarker != null)
	{
		return this.mEditionMarker.getPosition();
	}
	return null;
};
WegeooMap.prototype.displayMarkers = function (pMarkersInfo) 
{
	var vThis = this;
	
	var lMarkers = pMarkersInfo["classifieds"];
	
	if ( lMarkers instanceof Array)
	{
		
		//clear markers
		if(this.mMarkerCluster)
		{
			this.mMarkerCluster.clearMarkers();
			this.mGoogleMarkers = [];
		}
		
		//sort by latitude for a better render in the map.
		lMarkers.sort(function(lA , lB)
		{
		    return (lA.latitude > lB.latitude ? -1 : 1);
		});
		
		var lTotalLatitude = 0;
		var lTotalLongitude= 0;
		
		
        for (var iMarker = 0; iMarker < lMarkers.length; iMarker++)
        {
            //get marker
            var lMarkerInfo = lMarkers[iMarker];
	    	
	    	//compute average
			lTotalLatitude += parseFloat(lMarkerInfo.latitude);
			lTotalLongitude += parseFloat(lMarkerInfo.longitude);
			
			//create marker
	     	var latLng = new google.maps.LatLng(lMarkerInfo.latitude,lMarkerInfo.longitude);
	    	var marker = new google.maps.Marker({
	        	position: latLng,
	        	selected:this.mEnableSelection ? false : true,
	        	reference:lMarkerInfo.reference,
	        	properties:lMarkerInfo,
	        	enableSelection:this.mEnableSelection
	    	});
	    	
	    	//add marker
			this.mGoogleMarkers.push(marker);
			this.mGoogleMarkersDico[lMarkerInfo.reference] = marker;
	    }
		
		//Create average LatLng
        var lAverageLatitude = 0;
        var lAverageLatitude = 0;
        if ( lMarkers.length)
        {
            lAverageLatitude  = lTotalLatitude / lMarkers.length;
            lAverageLongitude = lTotalLongitude / lMarkers.length;
        }else{
            if ( pMarkersInfo.hasOwnProperty("town"))
            {
                lAverageLatitude  = pMarkersInfo["town"]["latitude"];
                lAverageLongitude = pMarkersInfo["town"]["longitude"];
            }
        }
        var lAverageLatLng = new google.maps.LatLng(lAverageLatitude,lAverageLongitude);
		
		//center 
		this.mGoogleMap.setCenter(lAverageLatLng);
		
		//zoom
		var lZoom = 12;
		if ( pMarkersInfo.hasOwnProperty("town"))
        {
            var lPop  = pMarkersInfo["town"]["pop"];
             
            if ( lPop  < 10000)
            {
                lZoom = 14;
            }else if ( lPop  < 55000)
            {
                lZoom = 13;
            }
        } 
		this.mGoogleMap.setZoom(lZoom);
		
	    try{ 
		    var vStyles = [{
		        states:{
		            normalState:{
		                icon        :'/bundles/wegeoowebsite/images/multimarker.png',
		                width       : 47,
                        height      : 55,
                        anchor      : [9,9],
                        textColor   : '#FFFFFF',
                        textSize    : 18,
                        offset      : [0,-30],
                        backgroundPosition: "-47px -69px"
		            },
		            selectedState:{
                        icon        :'/bundles/wegeoowebsite/images/multimarker.png',
                        width       : 47,
                        height      : 55,
                        anchor      : [9,9],
                        textColor   : '#FFFFFF',
                        textSize    : 18,
                        offset      : [0,-30],
                        backgroundPosition: "0 -69px"
                    },
                    normalHighlightState:{
                        icon        :'/bundles/wegeoowebsite/images/multimarker.png',
                        width       : 59,
                        height      : 69,
                        anchor      : [10,12],
                        textColor   : '#FFFFFF',
                        textSize    : 22,
                        offset      : [-3,-37],
                        backgroundPosition: "-59px 0 "
                    },
                    selectedHighlightState:{
                        icon        :'/bundles/wegeoowebsite/images/multimarker.png',
                        width       : 59,
                        height      : 69,
                        anchor      : [10,12],
                        textColor   : '#FFFFFF',
                        textSize    : 22,
                        offset      : [-3,-37],
                        backgroundPosition: "0 0"
                    }
		        }
		      }];
		    
		    var vOptions = {
		    	'styles'	:vStyles,
		    	gridSize	: 40,
		    	zoomOnClick	:false
		    };
		    
		    
	    	this.mMarkerCluster = new MarkerClusterer(this, this.mGoogleMarkers, vOptions );
	    	this.mMarkerCluster.addEventListener("redraw_complete" , function()
			{
				vThis.dispatchEvent("redraw_complete");
			});
	    }catch(e) {alert(e);}
	}
};
WegeooMap.prototype.highlightMarker = function(pReference)
{
    this.mMarkerCluster.removeHighlight();
     
    if ( pReference)
    {
        if ( this.mGoogleMarkersDico[pReference])
        {
            var lGoogleMarker = this.mGoogleMarkersDico[pReference];
            var lParentCluster = lGoogleMarker.parentCluster;
            
            //lParentCluster may be null if the marker is not in the displayed part of the map.
            if ( lParentCluster)
                lParentCluster.setHighlight(true);
        }else{
            //@ERROR
        }
    }else{
       //Nothing to do
    }
};

WegeooMap.prototype.getSelectedReferences = function()
{
    var lReferences = [];
    var lSelectedGoogleMarkers = this.mMarkerCluster.getSelectedGoogleMarkers();
    for(var iM = 0 ; iM < lSelectedGoogleMarkers.length ; iM++)
    {
        var lSelectedGoogleMarker = lSelectedGoogleMarkers[iM];
        lReferences.push(lSelectedGoogleMarker.properties);
    }
    return lReferences;
};

WegeooMap.prototype.getAnnonceReferencesFromCluster = function(inCluster)
{
	this.mSelectedCluster = inCluster;
	var vSelectedMarkers = this.mSelectedCluster.getMarkers();
	var vAnnonceReferences = [];
	for(var iMarker = 0 ; iMarker < vSelectedMarkers.length ; iMarker++ )
	{
		var vMarker = vSelectedMarkers[iMarker];
		vAnnonceReferences.push(vMarker.reference);
	}
	return vAnnonceReferences;
};


WegeooMap.prototype.addEventListener = function(inEventName , inEventCallback)
{
	this.mEvents[inEventName] = inEventCallback;
};
WegeooMap.prototype.removeEventListener = function(inEventName , inEventCallback)
{
	this.mEvents[inEventName] = null;
};
WegeooMap.prototype.dispatchEvent = function(pEventName)
{
	if ( this.mEvents[pEventName])
		this.mEvents[pEventName].call(null,this);
};
WegeooMap.prototype.getSelectedAnnonceReferences = function()
{
	return this.mReferences; 
};
WegeooMap.prototype.getSelectedClusterPosition = function()
{
	if ( this.mSelectedCluster == null ) return null;
	return this.mSelectedCluster.getCenter();
};
WegeooMap.prototype.selectClusterFromLatLng = function(inLat,inLng)
{
	this.mSelectedCluster = null;
	if ( this.mMarkerCluster)
	{
		var vClusters = this.mMarkerCluster.getClusters();
		for(var iCluster = 0 ; iCluster < vClusters.length ; iCluster++)
		{
			var vCluster = vClusters[iCluster];
			if ( vCluster.getCenter().lat() == inLat && vCluster.getCenter().lng() == inLng )
			{
				//alert("cluster found");
				this.mSelectedCluster = vCluster;
				this.mReferences = this.getAnnonceReferencesFromCluster(vCluster);
				
			}
		}
	}
};

WegeooMap.prototype.setExternalLatitudeInput = function(pHTMLElementName)
{
    this.mExternalLatitudeInput  = $('[name="' + pHTMLElementName + '"]');
};
WegeooMap.prototype.setExternalLongitudeInput = function(pHTMLElementName)
{
    this.mExternalLongitudeInput = $('[name="' + pHTMLElementName + '"]');
};

WegeooMap.prototype.getEditionMarkerLocation = function() { return this.mEditionMarker ? this.mEditionMarker.getPosition().toString() : null; };

WegeooMap.prototype.getMap = function() { return this.mGoogleMap; };

WegeooMap.prototype['create'] 		= WegeooMap.prototype.create;
WegeooMap.prototype['geocode'] 	    = WegeooMap.prototype.geocode;
WegeooMap.prototype['getMap'] 		= WegeooMap.prototype.getMap;