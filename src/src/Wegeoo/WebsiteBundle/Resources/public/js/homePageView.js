$(document).ready(function()
{
    //init strings
    for(var lKey in lStrings)
    {
        Wegeoo.FrontController.getInstance().addString(lKey , lStrings[lKey]);
    }

    //create page controller
    var lPageViewController = new Wegeoo.HomePageViewController();

    //create front controller
    Wegeoo.Service.BASE_URL = gBaseURL;
    //Wegeoo.FrontController.getInstance().registerStateParserFunction(parseState);
    //Wegeoo.FrontController.getInstance().registerStateCreatorFunction(createState);
    Wegeoo.FrontController.getInstance().setPageViewController(lPageViewController);

    /*
    var app = angular.module("Wegeoo" , []);
    app.directive('ngComment' , function()
	{
		return {
			template : '<p>Hello World</p>'
		};
	});
    */

});
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////   STATE MANAGEMENT
function createState()
{
    //subject
    var lSubject = Wegeoo.FrontController.getInstance().getString("estate");

    //category
    var lCategory = null;
    var lCategoryNode = $("ul#searchCategory li.active a");
    if (lCategoryNode.length == 1) {
        // to remove the character #.
        var lCategoryName = lCategoryNode.attr("href").substring(1);

        lCategory = Wegeoo.FrontController.getInstance().getString(lCategoryName);

        //store category to localData for a future display
        Wegeoo.FrontController.getInstance().storeLocalData(Wegeoo.StorageController.CATEGORY, lCategoryName);
    }

    // A SIMPLIFIER GRACE UN ATTRIBUT data-shortname
    //town
    var lSelectedTown = $("#search_town_input").getSelectedTown();
    var lPostalCode = lSelectedTown.postal_code;
    var lTown = lSelectedTown.uppercaseName.toLowerCase();

    //Propery Type filters
    var lPropertyTypes = $('#searchPropertyType').selectpicker("val");
    if (lPropertyTypes != null)
        lPropertyTypes = lPropertyTypes.join(",");
    //if ( lPropertyTypes == "")
    //    lPropertyTypes = "any";

    //Num Rooms filters
    var lNumRooms = $('#searchNumRooms').selectpicker("val");
    if (lNumRooms != null)
        lNumRooms = lNumRooms.join(",");

    //price
    var lPrices = "";
    var lPriceMin = $('#priceMin').val();
    var lPriceMax = $('#priceMax').val();
    if (lPriceMin != "" || lPriceMax != "") {
        if (lPriceMin == "")
            lPriceMin = "min";
        if (lPriceMax == "")
            lPriceMax = "max";

        lPrices = lPriceMin + "," + lPriceMax;
    }

    //Create filters
    var lFilters = "";
    if (lPropertyTypes && lPropertyTypes != "")
        lFilters += (lFilters == "" ? "" : "&") + "pt=" + lPropertyTypes;

    if (lNumRooms && lNumRooms != "")
        lFilters += (lFilters == "" ? "" : "&") + "nr=" + lNumRooms;

    if (lPrices != "")
        lFilters += (lFilters == "" ? "" : "&") + "pr=" + lPrices;

    var lState = gBaseURL + "/" + lSubject + "/" + lCategory + "/" + lPostalCode + "-" + lTown + "/search/" + lFilters;
    return lState;
};
function parseState(pState)
{
	//remove baseURL
	var lState = pState.replace(gBaseURL , "");
	
	//remove first /
	//lState = lState.substring(1);
	
	//split by /
    var lStateInfos = lState.split("/");

    if (lStateInfos.length > 0) {
        var lFilters = {};

        for (var iInfo = 0; iInfo < lStateInfos.length; iInfo++) {
            var lInfo = lStateInfos[iInfo];
            switch(iInfo)
            {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    var lReversoCategory = Wegeoo.FrontController.getInstance().getReverso(lInfo);
                    lFilters["ty"] = lReversoCategory;
                    break;
                case 3:
                    var lComaIndex = lInfo.indexOf("-");
                    if (lComaIndex >= 0) {
                        var lPostalCode = lInfo.substring(0, lComaIndex);
                        var lTownName = lInfo.substring(lInfo.indexOf("-") + 1);
                        lFilters["cn"] = lTownName;
                        lFilters["cp"] = lPostalCode;
                    }

                    break;
                    
                case 4:
                    "search";
                    break;
                case 5:
                    parseStateFilters(lInfo, lFilters);
                    break;

            }
        };

        return lFilters;
    }
}

function parseStateFilters(pInfo, pFilters)
{
    if (pInfo != "")
    {
        var lSplittedInfo = pInfo.split("&");
        for (var iFilter = 0; iFilter < lSplittedInfo.length; iFilter++)
        {
            //get filter value
            var lFilterExpression = lSplittedInfo[iFilter];
            var lFilterExpressionSplitted = lFilterExpression.split("=");
            var lFilterName = lFilterExpressionSplitted[0];
            var lFilterValue = lFilterExpressionSplitted[1];

            pFilters[lFilterName] = lFilterValue;
        }
    }
}
