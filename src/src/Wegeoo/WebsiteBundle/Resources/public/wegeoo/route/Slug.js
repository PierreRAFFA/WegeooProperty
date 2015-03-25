/**
 * Created by Pierre on 10/12/14.
 */
Wegeoo.Slug = function(name, shortName,  dataType)
{
    this.mName          = name;
    this.mShortName     = shortName;
    this.mDataType      = dataType;
    this.mRequirement   = null;
    this.mSlugViews     = [];
    this.mChildren              = [];
    this.mChildrenNameMap       = [];
    this.mChildrenShortNameMap  = [];
    this.mDelimiter     = ",";
    this.mDefaultValue = null;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// NAME
Wegeoo.Slug.prototype.getName = function()
{
    return this.mName;
};
Wegeoo.Slug.prototype.getShortName = function()
{
    return this.mShortName || this.mName;
};
Wegeoo.Slug.prototype.getDataType = function()
{
    return this.mDataType || "string";
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SLUG VIEWS
/**
 * Links a HTMLElement to the slug
 *
 * @param selector A string containing a selector expression to match elements against.
 * @param getterFunctionName string
 * @param setterFunctionName string
 * @param getterWebserviceFunctionName string
 */
Wegeoo.Slug.prototype.addSlugView = function(selector , getterFunctionName, setterFunctionName , getterWebserviceFunctionName)
{
    var lSlugView = new Wegeoo.SlugView(selector , getterFunctionName, setterFunctionName,getterWebserviceFunctionName);
    this.mSlugViews.push(lSlugView);
    return this;
};
Wegeoo.Slug.prototype.getSlugViews = function()
{
    return this.mSlugViews;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SLUG CHILDREN
Wegeoo.Slug.prototype.addChild = function(name, shortName, dataType)
{
    var lSlug = new Wegeoo.Slug(name,shortName,dataType);
    this.mChildren.push(lSlug);
    this.mChildrenNameMap[name] = lSlug;
    this.mChildrenShortNameMap[shortName] = lSlug;
    return lSlug;
};
Wegeoo.Slug.prototype.getChildren = function()
{
    return this.mChildren;
};
Wegeoo.Slug.prototype.getChildByName = function(name)
{
    var lSlug = null;
    if(this.mChildrenNameMap.hasOwnProperty(name))
        lSlug = this.mChildrenNameMap[name];
    return lSlug;
};
Wegeoo.Slug.prototype.getChildByShortName = function(name)
{
    var lSlug = null;
    if(this.mChildrenShortNameMap.hasOwnProperty(name))
        lSlug = this.mChildrenShortNameMap[name];
    return lSlug;
};
Wegeoo.Slug.prototype.hasChildren = function()
{
    return this.mChildren.length > 0;
}
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// REQUIREMENT
/**
 *
 * @param requirement Reg Expression
 * @returns {Wegeoo.Slug}
 */
Wegeoo.Slug.prototype.setRequirement = function(requirement)
{
    this.mRequirement = requirement;
    return this;
};
Wegeoo.Slug.prototype.getRequirement = function()
{
    return this.mRequirement;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// DEFAULT VALUE
Wegeoo.Slug.prototype.setDefaultValue = function(defaultValue)
{
    this.mDefaultValue = defaultValue;
    return this;
};
Wegeoo.Slug.prototype.getDefaultValue = function()
{
    return this.mDefaultValue;
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// DELIMITER
Wegeoo.Slug.prototype.setDelimiter = function(delimiter)
{
    this.mDelimiter = delimiter;
    return this;
};
Wegeoo.Slug.prototype.getDelimiter = function()
{
    return this.mDelimiter;
};

