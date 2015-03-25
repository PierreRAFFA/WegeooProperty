/**
 * Created by Pierre on 10/12/14.
 */
Wegeoo.Route = function(path)
{
    this.mPath  = path;
    this.mSlugs = [];
    this.mSlugMap = [];
};
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// SLUG
Wegeoo.Route.prototype.addSlug = function(name, shortName, dataType)
{
    var lSlug = new Wegeoo.Slug(name,shortName,dataType);
    this.mSlugs.push(lSlug);
    this.mSlugMap[name] = lSlug;

    return lSlug;
};
Wegeoo.Route.prototype.getSlugs = function()
{
    return this.mSlugs;
};
Wegeoo.Route.prototype.getSlugByName = function(name)
{
    var lSlug = null;
    if(this.mSlugMap.hasOwnProperty(name))
        lSlug = this.mSlugMap[name];
    return lSlug;
};
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
Wegeoo.Route.prototype.getPath = function()
{
    return this.mPath;
};