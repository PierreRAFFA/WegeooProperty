(function( $ )
{
    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    /**
     * SideMenu Map
     */
    $.fn.sideMenu = function(pOptions)
    {
        if ( typeof pOptions === 'string')
        {
            if (pOptions === "destroy")
            {
                if ($(this).data('sideMenu'))
                    $(this).data('sideMenu').remove();

                return;
            }else{
                pOptions = {
                    url : pOptions
                };
            }
        }
        var o = $.extend({}, $.SideMenu.defaults, pOptions);
        return this.each(function()
        {
            var $this = $(this);
            var ac = new $.SideMenu($this, o);
            $this.data('sideMenu', ac);
        });

    };

    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CONSTRUCTOR
    /**
     * SideMenu Object
     *
     * @param {jQuery} $pElement jQuery object with one input tag
     * @param {Object} pOptions Settings
     * @constructor
     */
    $.SideMenu = function($pElement, pOptions)
    {
        /** Jquery Element */
        this.mElement = $pElement;

        /** Map Options */
        this.mOptions = pOptions;

        /**  **/
        this.mCurrentSearchTownInput = null;


        this.render();
    }

    $.SideMenu.prototype.render = function()
    {
        this.renderSearchLocation();
        this.renderSearchPrice();
        this.renderSearchPropertyType();
        this.renderSearchNumRooms();
        this.renderSubmit();
    }
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////  LOCATION
    $.SideMenu.prototype.renderSearchLocation = function()
    {
        $(".searchTownInput").autocomplete({
            displayValue: function (inValue, inData) {
                return inData.libelle + " (" + inData.postCode + ")";
            }
        });
        $(".searchTownInput").keyup(this.onTownChange.bind(this));
    }
    $.SideMenu.prototype.onTownChange = function(event)
    {
        var vTown = event.target.value.toString();

        this.mCurrentSearchTownInput = $(event.currentTarget);

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
                        Wegeoo.FrontController.getInstance().filterTowns(lParameters , onTownsLoadComplete);
                    }
                } catch(vError) {
                    alert(vError);
                }
            } else {
                displayTowns(_lastResults);
            }
        }
    }
    $.SideMenu.prototype.onTownsLoadComplete = function(event)
    {
        var lData = event.getData();
        this.displayTowns(lData);
    };
    $.SideMenu.prototype.displayTowns = function(results)
    {
        if (results == null)
            return;

        //format data for the component
        var lResults = new Array();
        $.each(results, function(j, item)
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
        this.mCurrentSearchTownInput.autocomplete("destroy");

        try {
            this.mCurrentSearchTownInput.autocomplete({
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
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////  PROPERTY TYPE / NUM ROOMS
    $.SideMenu.prototype.renderSearchPropertyType = function()
    {
        $('.searchPropertyTypeSelect').selectpicker({
            dropupAuto : true
        });
    }
    $.SideMenu.prototype.renderSearchNumRooms = function()
    {
        $('.searchNumRoomsSelect').selectpicker({
            dropupAuto : true
        });
    }

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////  PRICE
    $.SideMenu.prototype.renderSearchPrice = function()
    {
        $("#search_pricefrom_input,#search_priceto_input").click(this.onPriceClick.bind(this));
        $("#search_pricefrom_input,#search_priceto_input").focusout(this.onPriceFocusOut.bind(this));
    }
    $.SideMenu.prototype.onPriceClick = function(e)
    {
        var vValue = ($(e.target).val());
        if ($(e.target).attr("id") == "search_pricefrom_input") {
            if (vValue == "min") {
                $(e.target).val("");
            }
        } else if ($(e.target).attr("id") == "search_priceto_input") {
            if (vValue == "max") {
                $(e.target).val("");
            }
        }
    }
    $.SideMenu.prototype.onPriceFocusOut = function(e)
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
    }
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////  SUBMIT
    $.SideMenu.prototype.renderSubmit = function()
    {
        //Search button
        $('.searchButtonSubmit').on('click', this.onSearchButtonClicked.bind(this));
    }
    $.SideMenu.prototype.onSearchButtonClicked = function(event)
    {
        if ( event)
            event.preventDefault();

        //check if a town is selected
        if ($(".searchTownInput:visible").getSelectedTown())
        {
            //close side menu if displayed
            if ($("#sideMenu").hasClass("active"))
                toggleAll();

            //display loading
            if ( $("#wegeooMap").length)
                $("#wegeooMap").startloading();

            //update state from page
            Wegeoo.FrontController.getInstance().updateStateFromPage();

            //debug
            //setTimeout(function(){
            //    Wegeoo.FrontController.getInstance().updateStateFromPage();
            //}, 2000);

        } else {
            //display alert only if this method is called from a tap on the search button
            if ( event)
            {
                BootstrapDialog.show({
                    type : BootstrapDialog.TYPE_WARNING,
                    message : "You have to select a city."
                });
            }
        }
    };
    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    /**
     * Default pOptions for plugin
     */
    $.SideMenu.defaults =
    {
        onLoad: null
    };

})( jQuery );