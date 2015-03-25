(function( $ )
{
    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    /**
     * Wegeoo Map
     */
    $.fn.wegeooMap = function(pOptions)
    {
        if ( typeof pOptions === 'string')
        {
            if (pOptions === "destroy")
            {
                if ($(this).data('wegeooMap'))
                    $(this).data('wegeooMap').remove();

                return;
            }else{
                pOptions = {
                    url : pOptions
                };
            }
        }
        var o = $.extend({}, $.WegeooMap.defaults, pOptions);
        return this.each(function()
        {
            var $this = $(this);
            var ac = new $.WegeooMap($this, o);
            $this.data('wegeooMap', ac);
        });

    };


    $.fn.addMarkers = function(markers,centerMap)
    {
        return this.each(function()
        {
            var $this = $(this);
            $this.data('wegeooMap').addMarkers(markers,centerMap);
        });
    }
    $.fn.clearMarkers = function()
    {
        $(this).data('wegeooMap').clearMarkers();
    };
    $.fn.moveTo = function(latitude,longitude)
    {
        $(this).data('wegeooMap').moveTo(latitude,longitude);
    };
    $.fn.getCenter = function()
    {
        return $(this).data('wegeooMap').getCenter();
    }
    $.fn.getZoom = function()
    {
        return $(this).data('wegeooMap').getZoom();
    };
    $.fn.getSelectedMarkers = function()
    {
        return $(this).data('wegeooMap').getSelectedMarkers();
    };
    $.fn.changeMarkerStateToNormal = function(reference)
    {
        return $(this).data('wegeooMap').changeMarkerStateToNormal(reference);
    };
    $.fn.changeMarkerStateToHighlight = function(reference)
    {
        return $(this).data('wegeooMap').changeMarkerStateToHighlight(reference);
    };

    $.fn.toString = function()
    {
        var lCenter = $(this).data('wegeooMap').getCenter();
        var lZoom = $(this).data('wegeooMap').getZoom();
        return "@" + lCenter.lat() + "," + lCenter.lng() + "," + lZoom;
    };

    /**
     * Returns the map bounds representation
     *
     * @returns {string} ex: @((51.4389117025899,-0.38026171108617746),(51.503069523911606,0.014559455906010044))
     */
    $.fn.getBounds = function()
    {
        var lBounds = $(this).data('wegeooMap').getBounds();
        if ( lBounds )
            return "@" + $(this).data('wegeooMap').getBounds().toString().replace(/ /g , "");
        return "@undefined";
    };

    $.fn.setExternalLatitudeInput = function(htmlElementName)
    {
        return $(this).data('wegeooMap').setExternalLatitudeInput(htmlElementName);
    };
    $.fn.setExternalLongitudeInput = function(htmlElementName)
    {
        return $(this).data('wegeooMap').setExternalLongitudeInput(htmlElementName);
    };
    $.fn.updateEditionMarkerPosition = function(lat,lng)
    {
        return $(this).data('wegeooMap').updateEditionMarkerPosition(lat,lng);
    };
    $.fn.geocode = function(search)
    {
        return $(this).data('wegeooMap').geocode(search);
    };
    $.fn.startloading = function()
    {
        return $(this).data('wegeooMap').startloading();
    };
    $.fn.stoploading = function()
    {
        return $(this).data('wegeooMap').stoploading();
    };

    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CONSTRUCTOR
    /**
     * WegeooMap Object
     *
     * @param {jQuery} $pElement jQuery object with one input tag
     * @param {Object} pOptions Settings
     * @constructor
     */
    $.WegeooMap = function($pElement, pOptions)
    {
        /** Jquery Element */
        this.mElement = $pElement;

        /** Map Options */
        this.mOptions = pOptions;

        /** Google maps */
        this.mGoogleMap = null;

        /** Div where loading design is displayed */
        this.mLoadingElement = null;
        this.mInterval = null;
        this.mLoadingElementRunning = false;
        this.mLoadingText = null;

        /** Markers Cluster */
        this.mMarkerCluster = null;

        /**
         * Marker By reference
         * @type {Object}
         */
        this.mMarkersMap = new Object();

        /**
         * Marker for Edition Mode only
         * @type {null}
         */
        this.mEditionMarker = null;

        /**
         * Assert parameters
         */
        if (!$pElement || !( $pElement instanceof jQuery) || $pElement.length !== 1 || $pElement.get(0).tagName.toUpperCase() !== 'DIV') {
            alert('Invalid parameter for jquery.WegeooMap, jQuery object with one element with div tag expected');
            return;
        }

        if (typeof google == "undefined")
            return;

        //parse attributes
        this.parseAttributes();

        //init view
        this.createGoogleMap();

        this.createLoadingElement();

    };
    $.WegeooMap.prototype.parseAttributes = function()
    {
        var lMode 	            = this.mElement.attr("mode");
        var lMarkerLongitude 	= this.mElement.attr("markerLongitude");
        var lMarkerLatitude 	= this.mElement.attr("markerLatitude");
        var lMapLatitude 		= this.mElement.attr("mapLatitude") || lMarkerLatitude;
        var lMapLongitude 		= this.mElement.attr("mapLongitude") || lMarkerLongitude;

        //override options
        this.mOptions.mode      = lMode;
        this.mOptions.markerLat = lMarkerLatitude;
        this.mOptions.markerLng = lMarkerLongitude;
        this.mOptions.mapLat    = lMapLatitude;
        this.mOptions.mapLng    = lMapLongitude;
    };
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CREATE GOOGLE MAP
    $.WegeooMap.prototype.createGoogleMap = function() {
        //create google maps
        var center = new google.maps.LatLng(this.mOptions.mapLat, this.mOptions.mapLng);
        this.mGoogleMap = new google.maps.Map(this.mElement.get(0),
            {
                zoom: 12,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: true,
                disableDefaultUI: true,
                zoomControl: true,
                scrollwheel: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                }

            });

        if ( this.mOptions.mode == $.WegeooMap.MODE_EDITION )
        {
            this.createEditionMap();
        }else{
            this.createNormalMap();
        }
    }
    $.WegeooMap.prototype.createNormalMap = function()
    {
        var lThis = this;
        google.maps.event.addListener(this.mGoogleMap, 'dragend', function()
        {
            if ( lThis.mOptions.onMapDragEnd)
            {
                lThis.mOptions.onMapDragEnd.call(null, this.getCenter(), this.getBounds());
            }
        });

        google.maps.event.addListener(this.mGoogleMap, 'bounds_changed', function()
        {
            google.maps.event.clearListeners(lThis.mGoogleMap, 'bounds_changed');

            if ( lThis.mOptions.onBoundsChanged)
            {
                lThis.mOptions.onBoundsChanged.call(null);
            }
        });

        //get lat lng of marker
        var lLatLng = new google.maps.LatLng(this.mOptions.markerLat,this.mOptions.markerLng);

        //in case of marker informations defined in the html on page load
        if ( this.mOptions.markerLat && this.mOptions.markerLng )
        {
            var lMarker = new google.maps.Marker(
                {
                    position: lLatLng,
                    selected: true,
                    reference:null,
                    properties:null,
                    draggable: this.mOptions.mode == $.WegeooMap.MODE_EDITION,
                    enableSelection:false
                });

            this.addMarkers(new Array(lMarker));
        }
    }
    $.WegeooMap.prototype.createEditionMap = function()
    {
        var lThis = this;

        //in case of marker informations defined in the html on page load
        if ( this.mOptions.markerLat && this.mOptions.markerLng )
        {
            //get lat lng of marker
            var lLatLng = new google.maps.LatLng(this.mOptions.markerLat,this.mOptions.markerLng);

            //get external inputs
            var $lExternalLatitudeElement = null;
            if (this.mOptions.hasOwnProperty("externalLatitudeInput"))
            {
                $lExternalLatitudeElement = $('[name="' + this.mOptions.externalLatitudeInput + '"]');
            }
            var $lExternalLongitudeElement = null;
            if (this.mOptions.hasOwnProperty("externalLongitudeInput"))
            {
                $lExternalLongitudeElement = $('[name="' + this.mOptions.externalLongitudeInput + '"]');
            }

            //create marker and update position
            if ( this.mEditionMarker == null)
            {
                this.mEditionMarker = new google.maps.Marker({
                    map: this.mGoogleMap,
                    draggable: true,
                    position: lLatLng
                });

                //add event
                var lThis = this;
                google.maps.event.addListener(this.mEditionMarker, 'dragend', function (event) {
                    if ($lExternalLatitudeElement)
                        $lExternalLatitudeElement.val(event.latLng.lat())

                    if ($lExternalLongitudeElement)
                        $lExternalLongitudeElement.val(event.latLng.lng());
                });

            }else {
                this.mEditionMarker.setPosition(lLatLng);
            }


            if ($lExternalLatitudeElement)
                $lExternalLatitudeElement.val(lLatLng.lat())

            if ($lExternalLongitudeElement)
                $lExternalLongitudeElement.val(lLatLng.lng());

            this.moveTo(lLatLng.lat(), lLatLng.lng() , 15);

        }
    };

    $.WegeooMap.prototype.updateEditionMarkerPosition = function(lat,lng)
    {
        this.mEditionMarker.setPosition(new google.maps.LatLng(lat,lng));
        this.moveTo(lat,lng , 15);
    };
    $.WegeooMap.prototype.geocode = function(inSearch)
    {
        var lThis = this;
        var vMap = this.mGoogleMap;
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': inSearch}, function(results, status)
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                vMap.setCenter(results[0].geometry.location);
                lThis.updateEditionMarkerPosition(results[0].geometry.location.lat() , results[0].geometry.location.lng());
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    };


    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// ADD MARKERS
    $.WegeooMap.prototype.createLoadingElement = function()
    {
        var lThis = this;

        //Create the loadingElement
        this.mLoadingElement = $("<div></div>");

        //prepend
        this.mElement.parent().prepend(this.mLoadingElement);

        //style it
        this.mLoadingElement.css({
            position:'absolute',
            display: 'none',
            'z-index': 10,
            top: '0px',
            left: '31px',
            width:'50px',
            height:'70px',
            overflow:'hidden'
        });

        //marker html string
        var lMarkerHTMLString = "<img src='/bundles/wegeoowebsite/images/loadingMarker.png' width='15' height='22'/>";

        //add marker
        var lTop = "-55px";
        var lAnimatedMarker = $(lMarkerHTMLString);
        lAnimatedMarker.attr("data-initial-top" , lTop);
        lAnimatedMarker.attr("data-animated" , "false");
        this.mLoadingElement.append(lAnimatedMarker);
        lAnimatedMarker.css({
            position:'absolute',
            top: lTop,
            left: '8px'
        });

        //add marker
        lTop = "-47px";
        lAnimatedMarker = $(lMarkerHTMLString);
        lAnimatedMarker.attr("data-initial-top" , lTop);
        lAnimatedMarker.attr("data-animated" , "false");
        this.mLoadingElement.append(lAnimatedMarker);
        lAnimatedMarker.css({
            position:'absolute',
            top: lTop,
            left: '18px'
        });

        //add marker
        lTop = "-37px";
        lAnimatedMarker = $(lMarkerHTMLString);
        lAnimatedMarker.attr("data-initial-top" , lTop);
        lAnimatedMarker.attr("data-animated" , "false");
        this.mLoadingElement.append(lAnimatedMarker);
        lAnimatedMarker.css({
            position:'absolute',
            top: lTop,
            left: '0px'
        });

        //add marker
        lTop = "-31px"
        lAnimatedMarker = $(lMarkerHTMLString);
        lAnimatedMarker.attr("data-initial-top" , lTop);
        lAnimatedMarker.attr("data-animated" , "false");
        this.mLoadingElement.append(lAnimatedMarker);
        lAnimatedMarker.css({
            position:'absolute',
            top: lTop,
            left: '24px'
        });

        //add loading text
        this.mLoadingText = $("<div>loading...</div>");
        this.mLoadingElement.append(this.mLoadingText);
        this.mLoadingText.css({
            position:'absolute',
            top: '50px',
            left: '0px',
            font:'0.875em FuturaStd-Medium',
            color:'#3276b1'
        });


        //this.startloading();
        //
        //setTimeout(function() {
        //    lThis.stoploading();
        //} , 4000 );

    };
    $.WegeooMap.prototype.startloading = function()
    {
        if ( this.mLoadingElementRunning == false)
        {
            var lThis = this;

            this.mLoadingElement.css("display" , "block");

            this.mLoadingElementRunning = true;
            this.mLoadingElement.children().each(function () {
                if ($(this).attr("data-animated") == "false")
                {
                    lThis.animateMarker(this);
                }else{
                    lThis.animateText(this);
                }
            });
        }
    };
    $.WegeooMap.prototype.stoploading = function()
    {
        console.log("stop");
        this.mLoadingElementRunning = false;
        this.hideIfAllAnimationsEnd();

    }
    $.WegeooMap.prototype.animateText = function(element)
    {
        //@TODO
    }
    $.WegeooMap.prototype.animateMarker = function(element)
    {
        console.log("animateMarker ? :"+this.mLoadingElementRunning);
        if ( this.mLoadingElementRunning)
        {
            console.log("animateMarker");
            console.log("mLoadingElementRunning:"+this.mLoadingElementRunning);
            var lThis = this;

            $(element).attr("data-animated" , "true");
            setTimeout(function() {
                $(element).animate({
                    top: parseInt($(element).attr("data-initial-top")) + 60 + "px"
                }, 1000, 'easeOutBounce', function () {
                    lThis.animateBlurDisappear($(element), 5);
                });
            } , Math.random() * 500);
        }else{
            this.hideIfAllAnimationsEnd();
        }
    };
    $.WegeooMap.prototype.hideIfAllAnimationsEnd = function()
    {
        var lIAreAllElementsAtInitalPosition = true;
        this.mLoadingElement.children().each(function ()
        {
            if(typeof $(this).attr("data-initial-top") != typeof undefined && $(this).css("top") != $(this).attr("data-initial-top"))
            {
                lIAreAllElementsAtInitalPosition = false;
            }
        });

        if ( lIAreAllElementsAtInitalPosition)
        {
            this.mLoadingElement.children().each(function ()
            {
                if(typeof $(this).attr("data-initial-top") != typeof undefined)
                    $(this).attr("data-animated" , "false");
            });

            this.mLoadingElement.css("display" , "none");
        }
    }
    $.WegeooMap.prototype.animateBlurDisappear = function(element, size)
    {
        var lThis = this;
        var filterVal = 'blur(' + size + 'px) opacity(0)';
        $(element)
            .css('filter', filterVal)
            .css('webkitFilter', filterVal)
            .css('mozFilter', filterVal)
            .css('oFilter', filterVal)
            .css('msFilter', filterVal)
            .css('transition', 'all 0.25s ease-out')
            .css('-webkit-transition', 'all 0.25s ease-out')
            .css('-moz-transition', 'all 0.25s ease-out')
            .css('-o-transition', 'all 0.25s ease-out');

        setTimeout(function(){
            $(element)
                .css('top', $(element).attr("data-initial-top"))
                .css('opacity', '100')
                .css('filter', 'none')
                .css('webkitFilter', 'none')
                .css('mozFilter', 'none')
                .css('oFilter', 'none')
                .css('msFilter', 'none')
                .css('transition', 'none')
                .css('-webkit-transition', 'none')
                .css('-moz-transition', 'none')
                .css('-o-transition', 'none');
            lThis.animateMarker($(element));
        }, 300 );
    }

    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// ADD MARKERS
    $.WegeooMap.prototype.addMarkers = function(markers, centerMap)
    {
        if ( markers instanceof Array)
        {
            var vOptions = {
                styles      :  $.WegeooMap.MARKER_STATES,
                gridSize	: 60,
                zoomOnClick	:false
            };

            //sort by latitude for a better render in the map.
            markers.sort(function(a , b)
            {
                return (a.metadata.latitude > b.metadata.latitude ? -1 : 1);
            });

            if ( this.mMarkerCluster == null)
            {
                this.mMarkerCluster = new MarkerClusterer(this.mGoogleMap, null, vOptions );
                this.mMarkerCluster.addEventListener("EventClusterSelected" , this.onClusterSelected.bind(this));
            }

            if ( markers.length)
            {
                //store markers in the map
                var lThis = this;
                $.each(markers,function(iM,marker)
                {
                    if ( marker.hasOwnProperty("metadata"))
                    {
                        lThis.mMarkersMap[marker.metadata.reference] = marker;
                    }
                });
                this.mMarkerCluster.addMarkers(markers);


                if ( centerMap == true )
                {
                    var lLat1 = null;
                    var lLng1 = null;
                    var lLat2 = null;
                    var lLng2 = null;

                    $.each(markers, function(iM,marker)
                    {
                        lLat1 = (lLat1 == null ? marker.position.lat() : Math.min(lLat1 , marker.position.lat()));
                        lLng1 = (lLng1 == null ? marker.position.lng() : Math.min(lLng1 , marker.position.lng()));

                        lLat2 = (lLat2 == null ? marker.position.lat() : Math.max(lLat2 , marker.position.lat()));
                        lLng2 = (lLng2 == null ? marker.position.lng() : Math.max(lLng2 , marker.position.lng()));
                    });

                    var lAverageLat = (lLat1 + lLat2 ) / 2;
                    var lAverageLng = (lLng1 + lLng2 ) / 2;

                    this.moveTo(lAverageLat , lAverageLng);
                }
            }
        }else{
            if ( this.mMarkerCluster != null)
                this.mMarkerCluster.redraw();
        }
    };
    $.WegeooMap.prototype.onClusterSelected = function()
    {
       if ( this.mOptions.onMarkerSelected)
       {
           this.mOptions.onMarkerSelected.call(null,this.mMarkerCluster.getSelectedMarkers());
       }
    };

    $.WegeooMap.prototype.getSelectedMarkers = function()
    {
        if ( this.mMarkerCluster)
            return this.mMarkerCluster.getSelectedMarkers();
        return null;
    };
    $.WegeooMap.prototype.changeMarkerStateToNormal = function(reference)
    {
        this.changeMarkerStateTo(reference,false);
    };
    $.WegeooMap.prototype.changeMarkerStateToHighlight = function(reference)
    {
        this.changeMarkerStateTo(reference,true);
    };
    $.WegeooMap.prototype.changeMarkerStateTo = function(reference , isHighlight)
    {
        //this.mMarkerCluster.removeHighlight();

        if ( reference)
        {
            if ( this.mMarkersMap[reference])
            {
                var lGoogleMarker = this.mMarkersMap[reference];
                var lParentCluster = lGoogleMarker.parentCluster;

                //lParentCluster may be null if the marker is not in the displayed part of the map.
                if ( lParentCluster)
                    lParentCluster.setHighlight(isHighlight);
            }else{
                //@ERROR
            }
        }else{
            //Nothing to do
        }
    };
    $.WegeooMap.prototype.clearMarkers = function()
    {
        if ( this.mMarkerCluster)
            this.mMarkerCluster.clearMarkers();

        //init map
        this.mMarkersMap = new Object();

    };
    ///////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////// MAP
    $.WegeooMap.prototype.moveTo = function(lat,lng,zoom)
    {
        var center = new google.maps.LatLng(lat,lng);
        this.mGoogleMap.setCenter(center);

        if(zoom)
        {
            this.mGoogleMap.setZoom(zoom);
        }
    };
    $.WegeooMap.prototype.getCenter = function()
    {
        return this.mGoogleMap.getCenter();
    };
    $.WegeooMap.prototype.getZoom = function()
    {
        return this.mGoogleMap.getZoom();
    };
    $.WegeooMap.prototype.getBounds = function()
    {
        return this.mGoogleMap.getBounds();
    };
    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    /**
     * Default pOptions for plugin
     */
    $.WegeooMap.defaults =
    {
        onMapDragEnd: null,
        onBoundChanged: null
    };

    $.WegeooMap.MODE_EDITION = "edition";
    $.WegeooMap.MODE_NORMAL  = "normal";


    $.WegeooMap.MARKER_STATES = [{
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
                backgroundPosition: "-59px 0"
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
    $.WegeooMap.MARKER_STATES = [{
        states:{
            normalState:{
                icon        :'/bundles/wegeoowebsite/images/multimarker@2x.png',
                width       : 54,
                height      : 63,
                anchor      : [13,1],
                textColor   : '#333',
                font        :'1.375em FuturaStd-Book',
                offset      : [0,-30],
                backgroundPosition: "-54px -79px",
                backgroundSize: '250%'
            },
            selectedState:{
                icon        :'/bundles/wegeoowebsite/images/multimarker@2x.png',
                width       : 54,
                height      : 63,
                anchor      : [13,1],
                textColor   : '#333',
                font        :'1.375em FuturaStd-Book',
                offset      : [0,-30],
                backgroundPosition: "0 -79px",
                backgroundSize: '250%'
            },
            normalHighlightState:{
                icon        :'/bundles/wegeoowebsite/images/multimarker@2x.png',
                width       : 59,
                height      : 69,
                anchor      : [13,1],
                textColor   : '#333',
                font        :'1.5em FuturaStd-Book',
                offset      : [-3,-37],
                backgroundPosition: "-59px 0",
                backgroundSize: '200%'
            },
            selectedHighlightState:{
                icon        :'/bundles/wegeoowebsite/images/multimarker@2x.png',
                width       : 59,
                height      : 69,
                anchor      : [13,1],
                textColor   : '#333',
                font        :'1.5em FuturaStd-Book',
                offset      : [-3,-37],
                backgroundPosition: "0 0",
                backgroundSize: '200%'
            }
        }
    }];
})( jQuery );