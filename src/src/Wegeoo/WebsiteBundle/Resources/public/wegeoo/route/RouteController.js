///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CONTRUCTOR
Wegeoo.RouteController = function()
{
    /**
     * Array of Wegeoo.Route
     * @type {Array}
     */
    this.mRoutes = [];
    /**
     * Array of value used to call filters webservice
     * @type {Array}
     */
    this.mRegisteredValues = {};


};
Wegeoo.RouteController.prototype.addRoute = function(path)
{
    var lRoute = new Wegeoo.Route(path);
    this.mRoutes.push(lRoute);

    return lRoute;
};
Wegeoo.RouteController.prototype.getSlugValue = function(slugName)
{
    if ( this.mRegisteredValues.hasOwnProperty(slugName))
        return this.mRegisteredValues[slugName];
    return null;
};
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////  POPSTATE EVENT
/**
 * @TODO
 */
Wegeoo.RouteController.prototype.listenPopStateEvent = function()
{
    //back and next button from internet browser
    var lThis = this;
    window.onpopstate = function(pEvent)
    {
        var lState = pEvent.state;
        lThis.onStateChanged(lState);
    };
};
Wegeoo.RouteController.prototype.onStateChanged = function(state)
{
    var lHref = window.location.href;

    var lState = lHref.substring(lHref.indexOf("/", 7));
    if (state) {
        lState = state;
    }
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SET STATE
/**
 * A voir si c'est pas mieux de l'utiliser que pour push des states et non pour setState
 *
 * @param pStateURL
 */
Wegeoo.RouteController.prototype.pushState = function(stateURL)
{
    if (stateURL)
    {
        var lRouteParameters = this.unserialiseState(stateURL);

        history.pushState(lRouteParameters, null, stateURL);

        Wegeoo.FrontController.getInstance().searchClassifieds(this.mRegisteredValues);
        //this.updatePageFromState();
    }
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// ON STATE CHANGED
Wegeoo.RouteController.prototype.unserialiseState = function(stateURL)
{
    //test each routes
    var lRouteParameters = {};

    var lThis = this;
    $.each(this.mRoutes, function(iR, route)
    {
        var lResults = lThis.match(route , stateURL);
        if ( lResults && lResults.length)
        {
            var lSlugs = route.getSlugs();
            $.each(lSlugs, function(iS, lSlug)
            {
                lRouteParameters[lSlug.getName()] = lResults[iS+1];
            });

            //break loop
            return false;
        }
    });

    return lRouteParameters;

};

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// UPDATE STATE FROM PAGE
Wegeoo.RouteController.prototype.updateStateFromPage = function()
{
    var lRoute = this.mRoutes[0];
    var lStateURL = lRoute.getPath();

    var lThis = this;
    var lSlugs = lRoute.getSlugs();
    $.each(lSlugs, function(iS, slug)
    {
        //get value and replace in the state URL
        var lValue = lThis.getValueFromSlug(slug);
        lStateURL = lStateURL.replace("{" + slug.getName() + "}" , lValue);

        //get webservice value and register
        var lWebserviceValue = lThis.getWebserviceValueFromSlug(slug);
        if (lWebserviceValue)
            lThis.registerValue(slug.getName() , lWebserviceValue);
    });

    this.pushState(Wegeoo.Service.BASE_URL + lStateURL);
};
Wegeoo.RouteController.prototype.getValueFromSlug = function(slug)
{
    var lValue = "";
    var lThis = this;

    //slugviews ?
    var lSlugViews = slug.getSlugViews();
    $.each(lSlugViews, function(jS, slugView)
    {
        var lGetter = slugView.getGetterFunctionName();
        if ( lGetter)
        {
            //some getter may be directly method with parameters, so no need to add brackets, otherwise add them
            var lEvalString = '$("' + slugView.getSelector() + '").' + slugView.getGetterFunctionName();

            var lHasBrackets = (lGetter.search(/\(/) != -1);
            if (lHasBrackets == false)
            {
                lEvalString += "()";
            }

            try{
                var lViewValue = eval(lEvalString);
            }catch (e)
            {
                console.log("Error when evaluating expression:"+lEvalString);
                lViewValue = "";
            }
            if ( lViewValue != null)
            {
                lValue += lViewValue;

                if (jS < lSlugViews.length-1)
                {
                    lValue += slug.getDelimiter();
                }
                if (jS == lSlugViews.length-1 && lValue == ";")
                {
                    lValue = "";
                }

            }
                //lValue += (lValue ? slug.getDelimiter() : "") + lViewValue;
        }
    });



    //children ?
    var lSlugChildren = slug.getChildren();
    $.each(lSlugChildren, function(jC, slugChild)
    {
        var lChildName = slugChild.getShortName();

        var lChildValue = lThis.getValueFromSlug(slugChild);

        lValue += (lValue ? slug.getDelimiter() : "") + lChildName + "=" + lChildValue;
    });

    return lValue;
};
Wegeoo.RouteController.prototype.getWebserviceValueFromSlug = function(slug)
{
    var lValue = "";
    var lThis = this;

    //slugviews ?
    var lSlugViews = slug.getSlugViews();
    $.each(lSlugViews, function(jS, slugView)
    {
        var lGetter = slugView.getGetterWebserviceFunctionName();
        if ( lGetter)
        {
            //some getter may be directly method with parameters, so no need to add brackets, otherwise add them
            var lEvalString = '$("' + slugView.getSelector() + '").' + slugView.getGetterWebserviceFunctionName();

            var lHasBrackets = (lGetter.search(/\(/) != -1);
            if (lHasBrackets == false)
            {
                lEvalString += "()";
            }

            try{
                var lViewValue = eval(lEvalString);
            }catch (e)
            {
                console.log("Error when evaluating expression:"+lEvalString);
                lViewValue = "";
            }
            if ( lViewValue != null)
            {
                if ( lViewValue instanceof Array)
                {
                    lValue = lViewValue;
                }else{
                    lValue += lViewValue;

                    if (jS < lSlugViews.length-1)
                    {
                        lValue += slug.getDelimiter();
                    }

                    if (jS == lSlugViews.length-1 && lValue == ";")
                    {
                        lValue = "";
                    }
                }
            }

        }
    });


    //children ?
    var lSlugChildren = slug.getChildren();
    $.each(lSlugChildren, function(jC, slugChild)
    {
        var lWebserviceValue = lThis.getWebserviceValueFromSlug(slugChild);

        if (lWebserviceValue)
            lThis.registerValue(slugChild.getName() , lWebserviceValue);

    });

    //prevent null in the search
    if ( lValue == null)
        lValue = "";

    return lValue;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// UPDATE PAGE FROM STATE
Wegeoo.RouteController.prototype.updatePageFromState = function()
{
    var lCurrentRouteURL = window.location.pathname;

    //update all slugViews
    var lThis = this;
    $.each(this.mRoutes, function(iR, route)
    {
        var lMatches = lThis.match(route , lCurrentRouteURL);
        if ( lMatches && lMatches.length)
        {
            if ( route.getPath() == "")
            {
                var lSlugs = route.getSlugs();
                $.each(lSlugs, function(iS, slug)
                {
                    var lFormattedValue = lThis.setValueToSlug(slug,slug.getDefaultValue());

                    if ( lFormattedValue != null)
                    {
                        if ( slug.hasChildren())
                        {
                            $.each(lFormattedValue, function(key, formattedValue)
                            {
                                lThis.registerValue(key , formattedValue);
                                //lFilters[key] = formattedValue;
                            });
                        }else{
                            lThis.registerValue(slug.getShortName() , lFormattedValue);
                            //lFilters[lSlug.getShortName()] = lFormattedValue;
                        }
                    }
                });

                //display Classifieds with parameters
                Wegeoo.FrontController.getInstance().searchClassifieds(lThis.mRegisteredValues);
            }else{

                var lFilters = {};
                var lSlugs = route.getSlugs();
                $.each(lMatches, function(iM, value)
                {
                    if ( iM == 0 )
                        return;

                    var lSlug = lSlugs[iM-1];
                    var lFormattedValue = lThis.setValueToSlug(lSlug,value);

                    if ( lFormattedValue != null)
                    {
                        if ( lSlug.hasChildren())
                        {
                            $.each(lFormattedValue, function(key, formattedValue)
                            {
                                lThis.registerValue(key , formattedValue);
                                //lFilters[key] = formattedValue;
                            });
                        }else{
                            lThis.registerValue(lSlug.getShortName() , lFormattedValue);
                            //lFilters[lSlug.getShortName()] = lFormattedValue;
                        }
                    }
                });

                //display Classifieds with parameters
                Wegeoo.FrontController.getInstance().searchClassifieds(lThis.mRegisteredValues);

                //break loop
                return false;
            }
        }
    });

    //means that no route was found
    //display Classifieds with default parameters
    //Wegeoo.FrontController.getInstance().searchClassifieds(lThis.mRegisteredValues);
};

Wegeoo.RouteController.prototype.setValueToSlug = function(slug,value)
{
    var lValues = null;

    var lThis = this;

    //slugViews
    var lSlugViews = slug.getSlugViews();

    //each slugView has its own value
    var lExplodedValues = null;
    if ( lSlugViews.length > 1)
        lExplodedValues = value.split(slug.getDelimiter());


    $.each(lSlugViews, function(iS, slugView)
    {
        var lSlugViewValue = lExplodedValues ? lExplodedValues[iS] : value;

        var lSetter = slugView.getSetterFunctionName();
        if ( lSetter)
        {
            var lFormattedValue = lSlugViewValue;

            switch(slug.getDataType())
            {
                case "enum":
                    if ( value != "")
                    {
                        lFormattedValue = "";
                        var lExplodedArray = value.split(",");
                        $.each(lExplodedArray, function(iE , exploded)
                        {
                            lFormattedValue += (lFormattedValue ? "," : "") + '"' + exploded + '"';
                        });

                        lFormattedValue = "[" + lFormattedValue + "]";

                        lValues = lExplodedArray;
                    }else{
                        lValues = null;
                    }

                    break;

                case "latLngZoom":
                    lFormattedValue = value;
                    var lEvalString = '$("' + slugView.getSelector() + '").' + slugView.getGetterWebserviceFunctionName();
                    try{
                        lValues = eval(lEvalString);
                    }catch(e)
                    {
                        console.log("Error when evaluating expression:" + lEvalString);
                    }
                    break;

                case "string":
                    lFormattedValue = value;
                    lValues = value;
                    break;

                case "interval":
                    lValues = value;
                    break;

                default: console.log("WARNING: The Slug DataType '" + slug.getDataType() + "' does not exist.");

            }

            //some getter may be directly method with parameters, so no need to add brackets, otherwise add them
            var lEvalString = '$("' + slugView.getSelector() + '").' + slugView.getSetterFunctionName().replace("%s" , lFormattedValue);
            console.log("setValueToSlug-lEvalString:"+lEvalString);


            try{
                eval(lEvalString);
            }catch(e)
            {
                console.log("Error when evaluating expression:" + lEvalString);
            }
        }
    });

    //Children
    var lSlugChildren = slug.getChildren();
    if ( lSlugChildren.length)
    {
        var lValues = {};
        var lExplodedValues = value.split(slug.getDelimiter());

        $.each(lExplodedValues, function(iE, explodedValue)
        {
            var lExplodedSubValues = explodedValue.split("=");
            if ( lExplodedSubValues.length == 2)
            {
                var lSlugShortName   = lExplodedSubValues[0];
                var lSlugValue  = lExplodedSubValues[1];

                var lSlugChild = slug.getChildByShortName(lSlugShortName);

                var lReturnedValue = lThis.setValueToSlug(lSlugChild , lSlugValue);

                if ( lReturnedValue )
                    lValues[lSlugChild.getName()] = lReturnedValue;
            }
        });
    }

    return lValues;

};

///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
Wegeoo.RouteController.prototype.registerValue = function(key, value)
{
    this.mRegisteredValues[key] = value;
};
Wegeoo.RouteController.prototype.match = function(route,routeURL)
{
    var lResults = null;

    var lRegExp = route.getPath();

    var lSlugs = route.getSlugs();
    $.each(lSlugs, function(i, slug)
    {
        lRegExp = lRegExp.replace("{" + slug.getName() + "}" , slug.getRequirement());
    });

    //replace / by \/
    lRegExp = Wegeoo.Service.BASE_URL + lRegExp;
    lRegExp = lRegExp.replace(/\//g , "\\/");
    lRegExp = new RegExp(lRegExp);

    lResults = lRegExp.exec(routeURL);

    return lResults;
}