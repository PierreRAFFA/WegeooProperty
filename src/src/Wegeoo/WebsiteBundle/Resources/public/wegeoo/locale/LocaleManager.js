Wegeoo.LocaleManager = function()
{
    this.mFolder;
    this.mLang = "fr_FR";
};
Wegeoo.LocaleManager.LOCALES = [];
Wegeoo.LocaleManager.REVERSO = [];
Wegeoo.LocaleManager.prototype.setFolder = function(pValue)
{
    this.mFolder = pValue;
};
Wegeoo.LocaleManager.prototype.setLang = function(pValue)
{
    
};
Wegeoo.LocaleManager.prototype.addString = function(pKey, pLocaleString)
{
    Wegeoo.LocaleManager.LOCALES[pKey] = pLocaleString;
    Wegeoo.LocaleManager.REVERSO[pLocaleString] = pKey;
};
Wegeoo.LocaleManager.prototype.getString = function(pValue)
{
    if (Wegeoo.LocaleManager.LOCALES.hasOwnProperty(pValue))
        return Wegeoo.LocaleManager.LOCALES[pValue];
    return null;
};
Wegeoo.LocaleManager.prototype.getReverso = function(pValue)
{
    if (Wegeoo.LocaleManager.REVERSO.hasOwnProperty(pValue))
        return Wegeoo.LocaleManager.REVERSO[pValue];
    return null;
};
