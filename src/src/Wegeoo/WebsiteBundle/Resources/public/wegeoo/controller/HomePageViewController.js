/**
 * This class should be modified in order to include only elements placed in all wegeoo websites and not elements from estate wegeoo website.
 * 
 */

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTRUCTOR
Wegeoo.HomePageViewController = function()
{
    this.mWegeooMap = null;
    this.min_area = 0;
    this.max_area = 100;
    this.minNumRooms = 1;
    this.maxNumRooms = 5;
    this.minNumBedrooms = 0;
    this.maxNumBedrooms = 5;
    this.minNumFloors = 1;
    this.maxNumFloors = 3;
    /** defines the number of classified ads at marker click */
    this.mStepDisplayedClassifiedAds = 10;
    /** Number of ads currently displayed */
    this.mNumClassifiedAdsDisplayed = 0;
    /** Determine if the map is on position fixed */
    this.mWegeooMapFixed = false;
    /** Determine the classified ads selected by user */
    this.mSelectedClassifiedAds = [];

    this.mInfiniteScrollParams = {};
    /** Represents the original Y of the map. Used to scroll to map */
    this.mOriginalMapPositionY = 0;

    this.mLocalOnly = false;

    this.mIsFirstSearch = true;

    this.mActiveSearchTownInput = null;
};
Wegeoo.HomePageViewController.prototype.init = function()
{
    var lThis = this;

    //hide search feedback
    $("#mapLoading").hide();

    //change alert title
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_WARNING] = "Warning";

    //listen any marker selection
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.MARKERS_SELECTION_CHANGED, this.onMarkersSelectionChanged.bind(this));
    //Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.STATE_CHANGED, this.onStateChanged.bind(this));
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.SEARCH_CLASSIFIEDS_COMPLETE, this.onClassifiedSearchedComplete.bind(this));
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.PREVIEW_CLASSIFIED_MOUSE_OVER, this.onPreviewClassifiedMouseOver.bind(this));
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.PREVIEW_CLASSIFIED_MOUSE_OUT, this.onPreviewClassifiedMouseOut.bind(this));

    this.registerRoutes();

    //load Google maps
    var lOptions = {};
    lOptions.onMarkerSelected   = this.onMarkerSelected.bind(this);
    lOptions.onMapDragEnd       = this.onMapDragEnd.bind(this);
    lOptions.onBoundsChanged     = this.onBoundsChanged.bind(this);

    if ( this.mLocalOnly == false)
    {
        $("#wegeooMap").wegeooMap(lOptions);
    }

    this.mOriginalMapPositionY = $("#mapLayout").offset().top;

    $('#resultLayoutSortList').selectpicker({
        dropupAuto : true
    });

    // incohérence ici car par défaut après une recherche, aucun marker n'est sélectionné.
    var $selectpicker = $('#resultLayoutSortList').data('selectpicker').$newElement;
    $selectpicker.on('hide.bs.dropdown', function()
    {
        var lSelectedSort = $('#resultLayoutSortList').selectpicker("val");
        Wegeoo.FrontController.getInstance().storeSessionData(Wegeoo.StorageController.SORT_BY , lSelectedSort);
        
        lThis.mInfiniteScrollParams.sort = lSelectedSort;
        $('#resultLayout').infiniteScroll(lThis.mInfiniteScrollParams);
    });

    //$('#searchCategory').tabs();

    //Search button
    $('.searchButtonSubmit').on('click', this.onSearchButtonClicked.bind(this));

    //Display Result button
    //$('#displayMarkerAnnouncementsButtonSubmit').on('click', this.displayAdsFromSelectedMarkers.bind(this));

    //Load all components
    //$(".searchTownInput").keyup(this.onTownChange.bind(this));
    $("#search_pricefrom_input,#search_priceto_input").click(this.onPriceClick);
    $("#search_pricefrom_input,#search_priceto_input").focusout(this.onPriceFocusOut);
    $("#cheapLocation").click(function()
    {
        var vIcon = $(this).children('div#icon')[0];
        var vOpacity = $(vIcon).css('opacity') == 1 ? 0.2 : 1;

        $(vIcon).css('opacity', vOpacity);
        var vLabel = $(this).children('div#label')[0];
        $(vLabel).css('opacity', vOpacity + 0.3);
    });

    $("#mapToolTip").tooltip({
        html : true
    });
    //$("#mapToolTip").tooltip('show');

    //force to change the view
    //this.onCategoryChange();

    this.computeMapHeight();

    var vMapLayoutY = $("#mapLayout").offset().top;
    var vMapLayoutW = $("#mapLayout").width();
    var vMapLayoutH = $("#mapLayout").height();

    //We want map always visible when classified ad list is displayed.
    //listen scroll for map and its position may be fixed
    //$(window).scroll(function()
    //{
    //    var vNumResultDisplayed = $("#resultLayout").children().length;
    //    if (vNumResultDisplayed > 0) {
    //        var lScrollPosition = $(window).scrollTop();
    //        vMapLayoutW = $("#mapLayout").width();
    //        if (lScrollPosition >= vMapLayoutY) {
    //            lThis.mWegeooMapFixed = true;
    //
    //            //put map to fixed
    //            $("#mapLayout").css("position", "fixed");
    //            $("#mapLayout").css("top", "0");
    //            $("#mapLayout").css("width", vMapLayoutW);
    //
    //            //set the same height to the map replacement, otherwise all elements above will go up
    //            $("#mapReplacementLayout").height(vMapLayoutH);
    //            $("#mapReplacementLayout").css("margin-top" , "10px");
    //            $("#mapReplacementLayout").css("margin-bottom" , "10px");
    //        } else {
    //            lThis.mWegeooMapFixed = false;
    //
    //            //put map to relative
    //            $("#mapLayout").css("position", "relative");
    //            $("#mapLayout").css("top", "");
    //            $("#mapLayout").css("width", "");
    //
    //            //reset the map replacement height
    //            $("#mapReplacementLayout").height(0);
    //            $("#mapReplacementLayout").css("margin-top" , "0");
    //            $("#mapReplacementLayout").css("margin-bottom" , "0");
    //        }
    //    }
    //});

    $(window).resize(function()
    {
        lThis.computeMapHeight();
        if (lThis.mWegeooMapFixed) {
            $("#mapLayout").width($("#mapReplacementLayout").width());
            vMapLayoutW = $("#mapLayout").width();
            vMapLayoutH = $("#mapLayout").height();
            $("#mapReplacementLayout").height(vMapLayoutH);
        }

    });

    var lParams = "";

    //set the div "resultLayout" to a infiniteScroll
    this.mInfiniteScrollParams = 
    {
        'contentPage' : 	gBaseURL + '/api/v1/previewclassifiedsdfdfdfdfdf/' + + '%s',
        'args' : 			[],
        'contentDataStep' : this.mStepDisplayedClassifiedAds,
        'scrollTarget' : 	$(window),
        'heightOffset' : 	500,
        'sort' : 			null,
        'buildURL' : 		function(pArgs)
        {
        	var lReferences = [];
        	for(iArg=0 ; iArg < pArgs.length ; iArg++)
        	{
        		var lReference = pArgs[iArg].reference;
        		lReferences.push(lReference);
        	}
        	$lBaseURL = gBaseURL + "/api/v1/previewclassifieds?references=" + lReferences.join(",") + "&sort=" + $('#resultLayoutSortList').selectpicker("val");
            return $lBaseURL;
        }
        /*,
        'afterLoad' : function(elementsLoaded)
        {
            lThis.onAfterLoadInfiniteScroll();
            $('#loading').fadeOut();
            var i = 0;

            lThis.mInfiniteScrollParams["args"] = lParams;

            // $(elementsLoaded).fadeInWithDelay();
            if ($('#content').children().size() > 100) {
                $('#nomoreresults').fadeIn();
                $('#content').stopScrollPagination();
            }
        }*/
    };


    $('#resultLayout').infiniteScroll(this.mInfiniteScrollParams);
    $('#resultLayout').disableInfiniteScroll();
    
    $('#banner').banner({
        delay : 2000
    });

    //sidemenu
    $("#sideMenu").sideMenu({});

};
Wegeoo.HomePageViewController.prototype.onClusterSelected = function()
{

}
///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////// REGISTER ROUTES
Wegeoo.HomePageViewController.prototype.registerRoutes = function()
{
    //route 1
    var lRoute = Wegeoo.FrontController.getInstance().addRoute("/{theme}/{category}/{cityPostCode}-{cityName}/search{map}/{filters}");
    lRoute.addSlug("theme")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView("#theme" , "val" , "val('%s')");
    lRoute.addSlug("category")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView(".searchCategoryRow:visible .searchCategory" , 'find("li.active a").attr("data-value")' , 'find("li a[data-value=%s]").tab("show")');
    lRoute.addSlug("cityPostCode")
        .setRequirement("([a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCityPostCode" , "setSelectedCityPostCode('%s')");
    lRoute.addSlug("cityName")
        .setRequirement("([-%a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCleanedCityName" , "setSelectedCityName('%s')");
    lRoute.addSlug("map" , "map", "latLngZoom")
        .setRequirement("(@[-.0-9]*,[-.0-9]*,[0-9]*)")
        .addSlugView("#wegeooMap" , "toString" , "moveTo" , "getBounds()");
    var lSlug = lRoute.addSlug("filters")
        .setRequirement("([;+&=,a-zA-Z0-9]*)")
        .setDelimiter("&");
    lSlug.addChild("propertyType", "pt" , "enum")
        .addSlugView(".searchForm:visible .searchPropertyTypeSelect" , 'selectpicker("val")' , 'selectpicker("val",%s)');
    lSlug.addChild("price" , "pr" , "interval")
        .setDelimiter(";")
        .addSlugView(".searchForm:visible .searchPriceMinInput" , "val" , "val('%s')")
        .addSlugView(".searchForm:visible .searchPriceMaxInput" , "val" , "val('%s')")
    lSlug.addChild("numRooms", "nr" , "enum")
        .addSlugView(".searchForm:visible .searchNumRoomsSelect"  , 'selectpicker("val")' , 'selectpicker("val",%s)');

    //route 2
    var lRoute = Wegeoo.FrontController.getInstance().addRoute("/{theme}/{category}/{cityPostCode}-{cityName}");
    lRoute.addSlug("theme")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView("#theme" , "val" , "val('%s')");
    lRoute.addSlug("category")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView(".searchCategoryRow:visible .searchCategory" , 'find("li.active a").attr("data-value")' , 'find("li a[data-value=%s]").tab("show")');
    lRoute.addSlug("cityPostCode")
        .setRequirement("([a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCityPostCode" , "setSelectedCityPostCode('%s')");
    lRoute.addSlug("cityName")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCleanedCityName" , "setSelectedCityName('%s')");

    //route 3
    var lRoute = Wegeoo.FrontController.getInstance().addRoute("");
    lRoute.addSlug("theme")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView("#theme" , "val" , "val('%s')")
        .setDefaultValue("property");
    lRoute.addSlug("category")
        .setRequirement("([-a-zA-Z0-9]*)")
        .addSlugView(".searchCategoryRow:visible .searchCategory" , 'find("li.active a").attr("data-value")' , 'find("li a[data-value=%s]").tab("show")')
        .setDefaultValue("sale");
    lRoute.addSlug("cityPostCode")
        .setRequirement("([a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCityPostCode" , "setSelectedCityPostCode('%s')")
        .setDefaultValue("city");
    lRoute.addSlug("cityName")
        .setRequirement("([-%a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCleanedCityName" , "setSelectedCityName('%s')")
        .setDefaultValue("london");

}
///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////  ON MAP BOUNDS LOADED
Wegeoo.HomePageViewController.prototype.onBoundsChanged = function(event)
{
    //load all views depending on stateURL
    Wegeoo.FrontController.getInstance().updatePageFromState();



    //load banner
    this.loadLatestClassifieds(gCityPostCode,gCityName);

};
///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////// REGISTER ROUTES
Wegeoo.HomePageViewController.prototype.loadLatestClassifieds = function(cityPostCode,cityName)
{
    var lCategory = Wegeoo.FrontController.getInstance().getSlugValue("category");

    if ( lCategory == null)
        lCategory = "rent";

    var lParameters = {};
    lParameters["category"]     = lCategory;
    lParameters["cityPostCode"] = cityPostCode;
    lParameters["cityName"]     = cityName;

    $("#cityName").text(cityName);
    Wegeoo.FrontController.getInstance().loadLatestClassifieds(lParameters , this.onLatestClassifiedLoadComplete.bind(this));
};
Wegeoo.HomePageViewController.prototype.onLatestClassifiedLoadComplete = function(event)
{
    var lData = event.getData();

    var lImages = [];

    $.each(lData , function(iC,lClassified)
    {
        var lMedias = lClassified.medias;

        var lImage = {};
        lImage.src = lMedias[0];
        lImage.href = lClassified.url;
        lImage.caption = lClassified.caption;
        lImages.push(lImage);
    });

    $('#banner').displayImages(lImages,true);
};

///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////// MAP EVENTS
Wegeoo.HomePageViewController.prototype.onMarkerSelected = function (markers)
{
    var lMarkersMetadata = [];
    $.each(markers, function(iM,marker)
    {
        lMarkersMetadata.push(marker.metadata);
    });

    this.displayClassifieds(lMarkersMetadata);
};
/**
 * OnMapDragEnd Event
 *
 * @param mapCenter Array of latitude, longitude
 * @param mapBounds Array of Array of latitude, longitude
 */
Wegeoo.HomePageViewController.prototype.onMapDragEnd = function (mapCenter,mapBounds)
{
    Wegeoo.FrontController.getInstance().updateStateFromPage();
    $("#wegeooMap").startloading();
};
///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////  DISPLAY CLASSIFIED AD
Wegeoo.HomePageViewController.prototype.displayAdsFromSelectedMarkers = function()
{
    var lSelectedMarkers = $("#wegeooMap").getSelectedMarkers();

    var lMarkersMetadata = [];
    $.each(lSelectedMarkers, function(iM,marker)
    {
        lMarkersMetadata.push(marker.metadata);
    });

    this.displayClassifieds(lMarkersMetadata);
};
Wegeoo.HomePageViewController.prototype.onPreviewClassifiedMouseOver = function(event)
{
    $("#wegeooMap").changeMarkerStateToHighlight(event.getData());
};
Wegeoo.HomePageViewController.prototype.onPreviewClassifiedMouseOut = function(event)
{
    $("#wegeooMap").changeMarkerStateToNormal(event.getData());
};

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.HomePageViewController.prototype.computeMapHeight = function()
{
    var vMapLayoutH = Math.min(300, $(window).height() / 2);
    $("#map_canvas").height(vMapLayoutH);
};
///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// ON SEARCH BUTTON CLICKED
Wegeoo.HomePageViewController.prototype.onSearchButtonClicked = function(pEvent)
{
    if ( pEvent)
        pEvent.preventDefault();

    //check if a town is selected
    if ($(".searchTownInput:visible").getSelectedCity())
    {
        //close side menu if displayed
        if ($("#sideMenu").hasClass("active"))
            toggleAll();

        //display loading
        $("#wegeooMap").startloading();

        //update state from page
        Wegeoo.FrontController.getInstance().updateStateFromPage();

        //debug
        //setTimeout(function(){
        //    Wegeoo.FrontController.getInstance().updateStateFromPage();
        //}, 2000);



    } else {
        //display alert only if this method is called from a tap on the search button
        if ( pEvent)
        {
            BootstrapDialog.show({
                type : BootstrapDialog.TYPE_WARNING,
                message : "You have to select a city."
            });
        }
    }
};

Wegeoo.HomePageViewController.prototype.onClassifiedSearchedComplete = function(event)
{

    $("#wegeooMap").stoploading();

    var lData = event.getData();

    //Display markers on Map
    if ( lData && lData["classifieds"])
    {
        var lIsNewSearch = lData.hasOwnProperty("city");

        //clean the result if it is a new search
        if ( lIsNewSearch )
            $('#resultLayout').empty();

        var lMarkers = [];
        $.each(lData["classifieds"], function(j, item)
        {
            var latLng = new google.maps.LatLng(item.latitude,item.longitude);
            var lMarker = new google.maps.Marker(
                {
                    position: latLng,
                    selected: false,
                    metadata:
                    {
                        reference: item.reference,
                        modificationDate: item.modification_date,
                        price: item.price
                    },
                    enableSelection:true
                });
            lMarkers.push(lMarker);
        });

        //if city, that means there is a new search
        if ( lIsNewSearch )
        {
            if ( this.mLocalOnly == false)
            {
                //clear old results
                $("#wegeooMap").clearMarkers();

                //change banner contents depending the search parameters
                this.loadLatestClassifieds(lData["city"]["postCode"],lData["city"]["uppercaseName"].toLowerCase());

                //add markers and place map on the average position, otherwise place on the city position
                if ( lMarkers.length)
                {
                    //add new markers
                    $("#wegeooMap").addMarkers(lMarkers,true);
                }else{
                    $("#wegeooMap").moveTo(lData["city"]["latitude"],lData["city"]["longitude"]);
                }
            }


            //Display Preview Classifieds (infinite scroll)
            this.displayClassifieds(lData["classifieds"]);

        }else{
            if ( this.mLocalOnly == false)
            {
                //just add the markers on the map
                $("#wegeooMap").addMarkers(lMarkers, false);
            }
        }
    }


};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////  STATE CHANGED
/**
 * At Home page, each state change means the filters changed, that's why 'filterClassifieds' method is called
 * This method is called when state changed:
 *  - by the Wegeoo Engine with 'setState' method
 *  - by browser buttons ( previous and next )
 *
 * @param pEvent
 */
Wegeoo.HomePageViewController.prototype.onStateChanged = function(pEvent)
{
    if ( pEvent)
    {
        var lState = pEvent.getData();

        //parse filters
        var lFilters = parseState(lState);

        //search from filters
        Wegeoo.FrontController.getInstance().filterClassifieds(lFilters , this.onClassifiedsFiltered.bind(this));
    }
};
Wegeoo.HomePageViewController.prototype.onClassifiedsFiltered = function(pEvent)
{
    var lData = pEvent.getData();

    //Display markers on Map
    if ( lData && lData["classifieds"])
    {
        var lMarkers = [];
        $.each(lData["classifieds"], function(j, item)
        {
            var latLng = new google.maps.LatLng(item.latitude,item.longitude);
            var lMarker = new google.maps.Marker(
                {
                    position: latLng,
                    selected: false,
                    metadata:
                    {
                        latitude: item.latitude,
                        longitude: item.longitude,
                        reference: item.reference,
                        modificationDate: item.modification_date,
                        price: item.price
                    },
                    enableSelection:true
                });
            lMarkers.push(lMarker);
        });

        $("#wegeooMap").addMarkers(lMarkers);
    }


    //Display Preview Classifieds (infinite scroll)
    //this.displayClassifieds(lData["classifieds"]);
}
Wegeoo.HomePageViewController.prototype.displayClassifieds = function(pClassifiedMetadatas)
{
    this.mInfiniteScrollParams.args = pClassifiedMetadatas;
    this.mInfiniteScrollParams.sort = $('#resultLayoutSortList').selectpicker("val");

    $('#resultLayout').infiniteScroll(this.mInfiniteScrollParams);

    if(this.mIsFirstSearch)
    {
        this.mIsFirstSearch = false;
    }else{
        Wegeoo.FrontController.getInstance().scrollToPosition(this.mOriginalMapPositionY);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////// ON MARKER SELECTION CHANGED
Wegeoo.HomePageViewController.prototype.onMarkersSelectionChanged = function(pEvent)
{
    //get google markers
    var lGoogleMarkers = pEvent.getData();

    //
    var lArgs = [];
    for(iMarker = 0 ; iMarker < lGoogleMarkers.length ; iMarker++)
    {
        var lGoogleMarker = lGoogleMarkers[iMarker];

        lArgs.push(lGoogleMarker);
    }

    //display classifieds
    this.displayClassifieds(lArgs);
};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.HomePageViewController.prototype.cleanAllAboutTown = function()
{
    $(".searchTownInput").val("");
    _twoFirstTownCharacters = "";
    displayTowns(null);
};
Wegeoo.HomePageViewController.prototype.onTownChange = function(inE)
{
    _isTownSelectionCorrect = false;
    var vTown = inE.target.value.toString();

    this.mActiveSearchTownInput = $(inE.currentTarget);

    if (vTown.length <= 2)
        _lastResults = null;

    var isThereAnyBracket = vTown.indexOf("(") >= 0 || vTown.indexOf(")") >= 0;

    if (vTown) {
        if (isThereAnyBracket == false) {
            try {
				if ( vTown.length >= 2)
				{
                    var lParameters = {};
                    lParameters["filterName"]   = "startwith";
                    lParameters["letters"]      = vTown + "%";
                    Wegeoo.FrontController.getInstance().filterTowns(lParameters , this.onTownsLoadComplete.bind(this));
				}
            } catch(vError) {
                alert(vError);
            }
        } else {
            this.displayTowns(_lastResults);
        }
    }
};
Wegeoo.HomePageViewController.prototype.onTownsLoadComplete = function(pEvent)
{
    var lData = pEvent.getData();
    this.displayTowns(lData);
};
Wegeoo.HomePageViewController.prototype.displayTowns = function(pResults)
{
    if (pResults == null)
        return;

    //format data for the component
    var lResults = new Array();
    $.each(pResults, function(j, item)
    {
        lResults.push({
            value : item.uppercaseName,
            data : {
                id : item.id,
                postCode : item.postCode,
                uppercaseName : item.uppercaseName,
                libelle : item.name,
                code : item.code,
                region_name : item.region_name,
                department_name : item.department_name,
                latitude:item.latitude,
                longitude:item.longitude
            }
        });

    });

    _lastResults = lResults;
    this.mActiveSearchTownInput.autocomplete("destroy");

    try {
        this.mActiveSearchTownInput.autocomplete({
            data : lResults,
            multiple : true,
            matchInside : false,
            useFilter : false,
            showResult : function(inValue, inData)
            {
                return inData.libelle + " (" + inData.postCode + ")";
            },
            displayValue : function(inValue, inData)
            {
                return inData.libelle + " (" + inData.postCode + ")";
            },
            onItemSelect : function(inData, inAutoCompleter)
            {
            }
        });

    } catch(e) {
        alert(e);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.HomePageViewController.prototype.onPriceClick = function(e)
{
    var vValue = ($(e.target).val());
    if ($(e.target).attr("id") == "search_pricefrom_input") {
        if (vValue == "min") {
            $(e.target).val("");
        }
    } else if ($(e.target).attr("id") == "search_priceto_input") {
        if (vValue == "max") {
            $(e.target).val("");
            //annonceId=<?php echo $vAnnonceId; ?>
        }
    }
};
Wegeoo.HomePageViewController.prototype.onPriceFocusOut = function(e)
{
    var vValue = ($(e.target).val());
    if ($(e.target).attr("id") == "search_pricefrom_input") {
        if (vValue == "") {
            $(e.target).val("min");
        }
    } else if ($(e.target).attr("id") == "search_priceto_input") {
        if (vValue == "") {
            $(e.target).val("max");
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.HomePageViewController.prototype.highlightMarker = function(pReference)
{
    this.mWegeooMap.highlightMarker(pReference);
};
