$(document).ready(function()
{
    loadWegeooEngine();
    loadComponents();
    registerRoutes();
    Wegeoo.FrontController.getInstance().updatePageFromState();
});

function loadWegeooEngine()
{
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.USER_ACTION_COMPLETE , onUserActionComplete);
    Wegeoo.FrontController.getInstance().addEventListener(Wegeoo.WegeooEvent.USER_ACTION_ERROR    , onUserActionError);
    Wegeoo.Service.BASE_URL = gBaseURL;
}
function loadComponents()
{
    $(document).on($.SideMenu.SUBMIT, this.onSideMenuSubmit.bind(this));

    //load Google maps
    var lOptions = {};
    $("#wegeooMap").wegeooMap(lOptions);

    //load slideshow
    var lSwiperConfig = {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: 'auto',
        loop: false
    };

    var lSwiperSlides = $(".swiper-container .swiper-slide");
    if ( lSwiperSlides && lSwiperSlides.length == 1)
        lSwiperConfig.slidesPerView = 1;

    var lSwiper = new Swiper('.swiper-container', lSwiperConfig);

    //load energetic
    $('#detailsEnergyConsumption').energeticArrow({
        type : "energyConsumption"
    });
    $('#detailsGreenhouseGasesEmission').energeticArrow({
        type : "greenhouseGasesEmission"
    });

    //sidemenu
    $("#sideMenu").sideMenu({});


}

function onSideMenuSubmit()
{
    //close side menu if displayed
    if ($("#sideMenu").hasClass("active"))
        toggleAll();

    //display loading
    if ( $("#wegeooMap").length)
        $("#wegeooMap").startloading();

    //update state from page
    Wegeoo.FrontController.getInstance().updateStateFromPage("_blank");
}
/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// WEGEOO EVENT CALLBACKS
function onUserActionComplete(pEvent)
{
    alert("Mail envoyé");
    if (pEvent) {

    }
}
function onUserActionError(pEvent)
{
    alert("Erreur dans l'envoi du mail");
}
/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
function displayAlert(pType)
{
    var $lAlertContainer = $('#'+pType);
    var lTitle = $lAlertContainer.attr("data-title");

    BootstrapDialog.show(
        {
            title: lTitle,
            message: function(dialog) {
                var $message = $lAlertContainer.clone();
                return $message;
        }
    });
}

function registerRoutes()
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
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCityName" , "setSelectedCityName('%s')");
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

    //route2
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
        .setRequirement("([-%a-zA-Z0-9]*)")
        .addSlugView(".searchForm:visible .searchTownInput" , "getSelectedCityName" , "setSelectedCityName('%s')");
    lRoute.addSlug("reference")
        .setRequirement("([-a-zA-Z0-9]*)");
}
/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
function contactAdvertiser(pReference)
{
    //Careful here the content of the popup is cloned to the bootstrap modal container.
    var lAction = {};
    lAction["name"]         = "contactAdvertiser";
    lAction["userName"]     = $(".modal-body #userName").val();
    lAction["userEmail"]    = $(".modal-body #userEmail").val();
    lAction["userMessage"]  = $(".modal-body #userMessage").val();

    var lParameters = {};
    lParameters["reference"]        = pReference;
    lParameters["numMailsReceived"] = "+";
    lParameters["captcha"]          = $(".modal-body #userCaptcha").val();
    lParameters["action"]           = lAction;

    Wegeoo.FrontController.getInstance().contactAdvertiser(lParameters);
}