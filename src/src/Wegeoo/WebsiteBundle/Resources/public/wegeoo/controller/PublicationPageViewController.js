/**
 * This class should be modified in order to include only elements placed in all wegeoo websites and not elements from estate wegeoo website.
 * 
 */

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTRUCTOR
Wegeoo.PublicationPageViewController = function()
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
    /* defines the number of classified ads at marker click */
    this.mStepDisplayedClassifiedAds = 30;
    /* Number of ads currently displayed */
    this.mNumClassifiedAdsDisplayed = 0;
    /** Determine if the map is on position fixed */
    this.mWegeooMapFixed = false;
    /** Determine the classified ads selected by user */
    this.mSelectedClassifiedAds = [];

    this.mInfiniteScrollParams = {};
    /** Represents the original Y of the map. Used to scroll to map */
    this.mOriginalMapPositionY = 0;
};

Wegeoo.PublicationPageViewController.prototype.init = function()
{
    var lThis = this;

    //change alert title
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_WARNING] = "Avertissement";

    //listen any marker selection
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.MARKERS_SELECTION_CHANGED, this.onMarkersSelectionChanged.bind(this));
    
    //load Google maps
    this.mWegeooMap = new WegeooMap();
    this.mWegeooMap.create('map_canvas');

    this.mOriginalMapPositionY = $("#mapLayout").offset().top;

    $('#searchPropertyType').selectpicker({
        dropupAuto : true
    });
    $('#searchNumRooms').selectpicker({
        dropupAuto : true
    });
    $('#resultLayoutSortList').selectpicker({
        dropupAuto : true
    });
    
    // incohérence ici car par défaut après une recherche, aucun marker n'est sélectionné.
    var $selectpicker = $('#resultLayoutSortList').data('selectpicker').$newElement;
    $selectpicker.on('hide.bs.dropdown', function()
    {
        var lSelectedSort = $('#resultLayoutSortList').selectpicker("val");
        Wegeoo.FrontController.getInstance().storeSessionData(Wegeoo.StorageController.SORT_BY , lSelectedSort);
        lThis.displayAdsFromSelectedMarkers(); 
    });

    //Search button
    $('#searchButtonSubmit').on('click', this.onSearchButtonClicked.bind(this));

    //Display Result button
    $('#displayMarkerAnnouncementsButtonSubmit').on('click', this.displayAdsFromSelectedMarkers.bind(this));

    //Load all components
    //$("#search_category").divlist({multiselect:false , change:this.onCategoryChange});
    $("#search_town_input").keyup(this.onTownChange.bind(this));
    //$("#search_estate_type").divlist({multiselect:true});
    //$("#search_announcer_type").divlist({multiselect:true});
    //$("#search_date_select").divlist({multiselect:false});
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
    $(window).scroll(function()
    {
        var vNumResultDisplayed = $("#resultLayout").children().length;
        if (vNumResultDisplayed > 0) {
            var lScrollPosition = $(window).scrollTop();
            vMapLayoutW = $("#mapLayout").width();
            if (lScrollPosition >= vMapLayoutY) {
                lThis.mWegeooMapFixed = true;

                //put map to fixed
                $("#mapLayout").css("position", "fixed");
                $("#mapLayout").css("top", "0");
                $("#mapLayout").css("width", vMapLayoutW);

                //set the same height to the map replacement, otherwise all elements above will go up
                $("#mapReplacementLayout").height(vMapLayoutH);
                $("#mapReplacementLayout").css("margin-top" , "10px");
                $("#mapReplacementLayout").css("margin-bottom" , "10px");
            } else {
                lThis.mWegeooMapFixed = false;

                //put map to relative
                $("#mapLayout").css("position", "relative");
                $("#mapLayout").css("top", "");
                $("#mapLayout").css("width", "");

                //reset the map replacement height
                $("#mapReplacementLayout").height(0);
                $("#mapReplacementLayout").css("margin-top" , "0");
                $("#mapReplacementLayout").css("margin-bottom" , "0");
            }
        }
    });

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

    var lParams = {};

    //set the div "resultLayout" to a infiniteScroll
    this.mInfiniteScrollParams = {
        'contentPage' : 'services.php',
        'contentData' : {},
        'contentDataStep' : this.mStepDisplayedClassifiedAds,
        'scrollTarget' : $(window),
        'heightOffset' : 10,
        'beforeLoad' : function()
        {
            this.contentData = lThis.onBeforeLoadInfiniteScroll();
        },
        'afterLoad' : function(elementsLoaded)
        {
            lThis.onAfterLoadInfiniteScroll();
            $('#loading').fadeOut();
            var i = 0;

            lThis.mInfiniteScrollParams["contentData"] = lParams;

            // $(elementsLoaded).fadeInWithDelay();
            if ($('#content').children().size() > 100) {
                $('#nomoreresults').fadeIn();
                $('#content').stopScrollPagination();
            }
        }
    };

    $('#resultLayout').infiniteScroll(this.mInfiniteScrollParams);
    $('#resultLayout').disableInfiniteScroll();
    
    $("#search_town_input").autocomplete({
        displayValue : function(inValue, inData)
        {
            return inData.libelle + " (" + inData.postal_code + ")";
        }
    });
    
    //init town
    if ( Wegeoo.FrontController.getInstance().getStateParserFunction())
    {
        var lHref = window.location.href;
        var lState = lHref.substring(lHref.indexOf("/", 7));
    
        var lStateInfos = Wegeoo.FrontController.getInstance().getStateParserFunction().call(null,lState);
        if ( lStateInfos.hasOwnProperty("town"))
        {
            var lTown = lStateInfos["town"];
            if ( lTown.hasOwnProperty("value"))
            {
                var lTownValue = lTown["value"];
                if ( lTownValue.hasOwnProperty("name") && lTownValue.hasOwnProperty("postal_code") )
                {
                    var lTownName       = lTownValue["name"];
                    var lTownPostalCode = lTownValue["postal_code"];
                    $("#search_town_input").setSelectedTown(lTownName , lTownPostalCode);
                }
            }
           
        }
    }
};
///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////  DISPLAY CLASSIFIED AD
Wegeoo.PublicationPageViewController.prototype.displayAdsFromSelectedMarkers = function()
{
    var lSelectedReferences = this.mWegeooMap.getSelectedReferences();
    Wegeoo.FrontController.getInstance().setSelectedReferences(lSelectedReferences);
};
    
///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////// INFINITE SCROLL UTILS
Wegeoo.PublicationPageViewController.prototype.onBeforeLoadInfiniteScroll = function()
{
    //get beginIndex and endIndex
    var lBeginIndex = this.mNumClassifiedAdsDisplayed;
    var lEndIndex = lBeginIndex + this.mStepDisplayedClassifiedAds;
    this.mNumClassifiedAdsDisplayed = lEndIndex;

    //limit on EndIndex
    if (lEndIndex > this.mSelectedClassifiedAds.length)
        lEndIndex = this.mSelectedClassifiedAds.length;

    //get current references to load
    var lCurrentReferences = this.mSelectedClassifiedAds.slice(lBeginIndex, lEndIndex);

    //create ajax params for theses references.
    var lParams = {};
    lParams["operation"] = Wegeoo.Operation.GET_CLASSIFIED_AD_LIST_VIEW;
    lParams["classifiedAdReferences"] = JSON.stringify(lCurrentReferences);
    lParams["orderBy"] = $('#resultLayoutSortList').selectpicker("val");
    return lParams;
};
Wegeoo.PublicationPageViewController.prototype.onAfterLoadInfiniteScroll = function()
{
    this.mNumClassifiedAdsDisplayed = $('#resultLayout').children().length;

    if (this.mNumClassifiedAdsDisplayed >= this.mSelectedClassifiedAds.length) {
        $('#resultLayout').disableInfiniteScroll();
    }
};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.PublicationPageViewController.prototype.computeMapHeight = function()
{
    var vMapLayoutH = Math.min(300, $(window).height() / 2);
    $("#map_canvas").height(vMapLayoutH);
};
///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////// ON SEARCH BUTTON CLICKED
Wegeoo.PublicationPageViewController.prototype.onSearchButtonClicked = function(pEvent)
{
    pEvent.preventDefault();
    
    //town
    var lSelectedTown = $("#search_town_input").getSelectedTown();

    if (lSelectedTown) {
        if (Wegeoo.FrontController.getInstance().getStateCreatorFunction()) {
            var lState = Wegeoo.FrontController.getInstance().getStateCreatorFunction().call(null);
            Wegeoo.FrontController.getInstance().setState(lState);
        } else {
            console.log("");
            alert("");
        }
    } else {
        BootstrapDialog.show({
            type : BootstrapDialog.TYPE_WARNING,
            message : "Vous devez sélectionner une ville pour lancer une recherche."
        });
    }

};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.PublicationPageViewController.prototype.cleanAllAboutTown = function()
{
    $("#search_town_input").val("");
    _twoFirstTownCharacters = "";
    displayTowns(null);
};
Wegeoo.PublicationPageViewController.prototype.onTownChange = function(inE)
{
    _isTownSelectionCorrect = false;
    var vTown = inE.target.value.toString();

    if (vTown.length <= 2)
        _lastResults = null;

    var isThereAnyBracket = vTown.indexOf("(") >= 0 || vTown.indexOf(")") >= 0;

    if (vTown) {
        if (isThereAnyBracket == false) {
            try {
                var lParams = new Array();
                lParams["townFirstLetters"] = vTown;

                var lService = new Wegeoo.Service();
                lService.addEventListener(Wegeoo.ServiceEvent.COMPLETE, this.onTownsLoadComplete.bind(this));
                lService.sendRequest(Wegeoo.Operation.SEARCH_TOWNS, lParams);

            } catch(vError) {
                alert(vError);
            }
        } else {
            this.displayTowns(_lastResults);
        }
    }
};
Wegeoo.PublicationPageViewController.prototype.onTownsLoadComplete = function(pEvent)
{
    pEvent.getTarget().removeEventListener(Wegeoo.ServiceEvent.COMPLETE, this.onTownsLoadComplete);

    var lData = pEvent.getData();
    this.displayTowns(lData);
};
Wegeoo.PublicationPageViewController.prototype.displayTowns = function(pResults)
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
                postal_code : item.postal_code,
                uppercaseName : item.uppercaseName,
                libelle : item.libelle,
                codgeo : item.codgeo,
                region_name : item.region_name,
                department_name : item.department_name
            }
        });

    });

    _lastResults = lResults;
    $("#search_town_input").autocomplete("destroy");

    try {
        $("#search_town_input").autocomplete({
            data : lResults,
            multiple : true,
            matchInside : false,
            useFilter : false,
            showResult : function(inValue, inData)
            {
                return inData.libelle + " (" + inData.postal_code + ")";
            },
            displayValue : function(inValue, inData)
            {
                return inData.libelle + " (" + inData.postal_code + ")";
            },
            onItemSelect : function(inData, inAutoCompleter)
            {
                //Wegeoo.FrontController.getInstance().registerSearchTownData(inData.data);
                //$('input[name="town"]').val(inData.value);
                //$('input[name="postal_code"]').val(inData.data.postal_code);
                //$('input[name="insee"]').val(inData.data.insee);
                _isTownSelectionCorrect = true;
            }
        });

    } catch(e) {
        alert(e);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.PublicationPageViewController.prototype.onPriceClick = function(e)
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
Wegeoo.PublicationPageViewController.prototype.onPriceFocusOut = function(e)
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
Wegeoo.PublicationPageViewController.prototype.onMarkersSelectionChanged = function(pEvent)
{
    //clear classified ads
    this.clearClassifiedAds();

    //add new classified ads
    var lClassifiedAdReferences = pEvent.getData();
    this.displayClassifiedAds(lClassifiedAdReferences);
};
Wegeoo.PublicationPageViewController.prototype.clearClassifiedAds = function()
{
    //@TODO

    this.mNumClassifiedAdsDisplayed = 0;
};
Wegeoo.PublicationPageViewController.prototype.displayClassifiedAds = function(pClassifiedAdReferences)
{
    this.mSelectedClassifiedAds = pClassifiedAdReferences;

    $('#resultLayout').infiniteScroll(this.mInfiniteScrollParams);

    Wegeoo.FrontController.getInstance().scrollToPosition(this.mOriginalMapPositionY);
};
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.PublicationPageViewController.prototype.highlightMarker = function(pReference)
{
    this.mWegeooMap.highlightMarker(pReference);
};
