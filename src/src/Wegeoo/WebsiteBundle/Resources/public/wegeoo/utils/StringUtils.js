Wegeoo.StringUtils = function()
{
    
};

Wegeoo.StringUtils.substrCount = function(pStr , pCharacter)
{
    var lSubstrings = pStr.match(new RegExp(pCharacter,"gi"));
    if ( lSubstrings)
        return lSubstrings.length;
    return 0;
};
