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

    $("#sideMenu").sideMenu({});
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
    var lRoute = Wegeoo.FrontController.getInstance().addRoute("/{theme}/{category}/{cityPostCode}-{cityName}/{reference}");
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