///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTRCUTOR
Wegeoo.SearchController = function()
{

};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// REGISTER SEARCH
Wegeoo.SearchController.prototype.registerSearchTownData = function(pTownData)
{

};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SEARCH
Wegeoo.SearchController.prototype.search = function(pFilters)
{
    //var lSelectedTown = this.searchModel.townData;
    //lSelectedTown = "34172";

    if (pFilters.hasOwnProperty("cn")) {
        //var lJSON = {};
        //lJSON.codgeo 			= "equal(" + this.searchModel.townData.codgeo + ")";
        //lJSON.codgeo 			= "equal(" + 34172 + ")";
        //lJSON.price 			= "interval(" + $("#search_pricefrom_input").val() +","+ $("#search_priceto_input").val() + ")";
        //lJSON.living_area 	  	= "interval(" + $("#area_slider").slider('getFormatedValue').join(",") + ")";

        /*
         var vEstateType			= $("#shareForm #search_estate_type").divlistValue();
         var vAnnouncerType		= $("#shareForm #search_announcer_type").divlistValue();

         var vNumRoomsFrom 		= $("#shareForm #num_rooms_value1").html();
         var vNumRoomsTo 		= $("#shareForm #num_rooms_value2").html();

         var vNumBedroomsFrom 	= $("#shareForm #num_bedrooms_value1").html();
         var vNumBedroomsTo	 	= $("#shareForm #num_bedrooms_value2").html();

         var vNumFloorsFrom 		= $("#shareForm #floor_value1").html();
         var vNumFloorsTo 		= $("#shareForm #floor_value2").html();

         var vDate				= $("#shareForm #search_date_select").val();

         var vUrgentAnnonces 	= Math.floor($("#shareForm #urgentAnnonces #icon").css('opacity'));
         var vWithPhotos 		= Math.floor($("#shareForm #withPhotos #icon").css('opacity'));
         var vCheapLocation 		= Math.floor($("#shareForm #cheapLocation #icon").css('opacity'));
         var lGeolocalized 		= Math.floor($("#shareForm #geolocalized #icon").css('opacity'));

         var vFurnished			= $("#shareForm #furnished").checked;

         lJSON.keywords 				= "group_by_search_keywords("+vKeyWords+")";
         lJSON.codgeo				= "equal("+lCodgeo+")";

         lJSON.energy_consumption	= getConsumption();
         lJSON.greenhouse_gases_emission	= getGreenHouseGasesEmission();
         lJSON.price 				= "interval("+vPriceFrom +","+vPriceTo+")";
         lJSON.living_area 			= "interval("+vAreaFrom +","+vAreaTo+")";
         lJSON.property_type			= "one_of("+vEstateType+")";
         lJSON.num_rooms				= "interval("+vNumRoomsFrom +","+vNumRoomsTo+")";
         lJSON.num_bedrooms			= "interval("+vNumBedroomsFrom +","+vNumBedroomsTo+")";
         lJSON.floor					= "interval("+vNumFloorsFrom +","+vNumFloorsTo+")";
         lJSON.modification_date		= "date_diff_inferior("+vDate+")";
         lJSON.is_professional_announcement = "one_of("+vAnnouncerType+")";

         if ( vUrgentAnnonces == 1)
         lJSON.is_urgent				= "equal(1)";
         if ( vWithPhotos == 1)
         lJSON.with_photos			= "equal(1)";
         if ( vFurnished)
         lJSON.furnished				= "equal(1)";
         if ( vCheapLocation)
         lJSON.isCheapRent			= "equal(1)";
         if ( lGeolocalized)
         lJSON.geolocalized			= "equal(TRUE)";
         */
        var lParameters = [];
        lParameters["filter_params"] = pFilters;

        var lService = new Wegeoo.Service();
        lService.addEventListener(Wegeoo.ServiceEvent.COMPLETE  , this.onSearchComplete.bind(this));
        lService.addEventListener(Wegeoo.ServiceEvent.ERROR     , this.onSearchComplete.bind(this));
        lService.get(Wegeoo.Service.ROUTE_CLASSIFIEDS , lParameters);
    }
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// ON SEARCH COMPLETE
Wegeoo.SearchController.prototype.onSearchComplete = function(pEvent)
{
    pEvent.getTarget().removeEventListener(Wegeoo.ServiceEvent.COMPLETE  , this.onSearchComplete.bind(this));
    pEvent.getTarget().removeEventListener(Wegeoo.ServiceEvent.ERROR     , this.onSearchComplete.bind(this));

    var lData = pEvent.getData();

    //Display markers on Map
    Wegeoo.FrontController.getInstance().displayMarkers(lData);

    //Get all references from BDD result
    if (lData.hasOwnProperty("classifieds")) {
        var lAnnouncements = lData["classifieds"];
        var lReferences = [];
        for (var iM = 0; iM < lAnnouncements.length; iM++)
        {
            var lAnnonce = lAnnouncements[iM];
            lReferences.push(lAnnonce);
        }

        //Display Result under the map
        Wegeoo.FrontController.getInstance().setSelectedReferences(lReferences);
    }
};