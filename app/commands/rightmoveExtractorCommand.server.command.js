'use strict';

var ExtractorCommand = require('./extractorCommand.server.command');
var _      = require('lodash');

_.isArray('   fgofi f     ');
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// CONSTRUCTOR
function RightmoveExtractorCommand() {

    ExtractorCommand.call(this);
    ExtractorCommand.DEBUG = true;

    /**
     * All informations from crawler stored.
     * @type {{}}
     */
    this.crawledInfos = {};
}

/** Override of Phaser Game */
RightmoveExtractorCommand.prototype = Object.create( ExtractorCommand.prototype);
RightmoveExtractorCommand.prototype.constructor = RightmoveExtractorCommand;

RightmoveExtractorCommand.PREFIX = 'rm-';
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// BUILD URLs
RightmoveExtractorCommand.prototype.registerSaleRss = function()
{
    ExtractorCommand.prototype.registerSaleRss.call(this);

    var baseURL = 'http://www.rightmove.co.uk/rss/property-for-sale/find.html?locationIdentifier=REGION%5E{0}';

    for(var id = 87490 ; id <= 90000 ; id++)
    {
        this.rssUrls.push({url:baseURL.replace('{0}', id), category: 'rent'});
    }
    for(id = 1 ; id <= 87490 ; id++)
    {
        this.rssUrls.push({url:baseURL.replace('{0}', id), category: 'rent'});
    }

};
RightmoveExtractorCommand.prototype.registerRentRss = function()
{
    ExtractorCommand.prototype.registerRentRss.call(this);

    var baseURL = 'http://www.rightmove.co.uk/rss/property-to-rent/find.html?locationIdentifier=REGION%5E{0}';

    for(var id = 87490 ; id <= 90000 ; id++)
    {
        this.rssUrls.push({url:baseURL.replace('{0}', id), category: 'rent'});
    }
    for(id = 1 ; id <= 87490 ; id++)
    {
        this.rssUrls.push({url:baseURL.replace('{0}', id), category: 'rent'});
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// PARSE ITEMS
RightmoveExtractorCommand.prototype.getItems = function(rss)
{
    return rss.rss.channel[0].item;
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// CRAWLER
RightmoveExtractorCommand.prototype.onLinkCrawled = function(error, result, $, callback)
{
    var self = this;

    //latitude and longitude
    var matches = result.body.match(/"latitude":([-\.0-9]*),"longitude":([-\.0-9]*)/);
    if (matches.length > 2)
    {
        this.crawledInfos.latitude = parseFloat(matches[1]);
        this.crawledInfos.longitude = parseFloat(matches[2]);
    }

    //external media
    var regex = /<a target="_blank" rel="nofollow" href="[&=?\-:/._a-zA-Z0-9]*"><img src="([\-:/._a-zA-Z0-9]*)"/g;
    var medias = [];
    while ((matches = regex.exec(result.body)) !== null) {
        medias.push(matches[1]);
    }
    this.crawledInfos.externalMedias = medias;

    $('p[id=\'propertyHeaderPrice\'] > strong').each( function(index, price)
    {
        console.dir(price.children.length);

        var wholePrice = '';
        price.children.forEach( function(child)
        {
            wholePrice += child.data;
        });

        wholePrice = wholePrice.replace(/\r\n/g , '');
        wholePrice = wholePrice.replace(/\t/g , '');
        wholePrice = wholePrice.replace(/,/g , '');

        if ( self.currentCategory === 'sale')
        {
            matches = wholePrice.match(/([,0-9]*)/g);
            if(matches.length > 1)
            {
                self.crawledInfos.price = parseFloat(matches[1]);
                self.crawledInfos.currency = '&pounds;';
            }
        }else if ( self.currentCategory === 'rent')
        {
            matches = wholePrice.match(/£([,0-9]+) pw.*£([,0-9]+) pcm/);
            if ( matches.length > 2)
            {
                self.crawledInfos.weekPrice     = parseFloat(matches[1]);
                self.crawledInfos.monthPrice    = parseFloat(matches[2]);
                self.crawledInfos.price         = self.crawledInfos.monthPrice;
                self.crawledInfos.currency      = '&pounds;';
            }
        }

        callback.call(self);
    });
    console.dir(this.crawledInfos);

};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// ITEM PROPERTIES
RightmoveExtractorCommand.prototype.getItemReference = function(item)
{
    var reference = '';
    var matches = item.guid[0]._.match(/property-([0-9]*).html/);
    if ( matches.length > 1)
        reference = RightmoveExtractorCommand.PREFIX + matches[1];

    return reference;
};
RightmoveExtractorCommand.prototype.getItemLink = function(item)
{
    return item.link;
};
RightmoveExtractorCommand.prototype.getCity = function(item)
{
    var city = null;

    var title = item.title[0];
    console.dir(title);

    title = title.replace(/\n/g , ' ');
    title = title.replace(/\t/g , ' ');
    console.dir(title);



    var explodedTitle = title.split(':');
    if (explodedTitle.length === 3)
    {
        var cityInfos = _.trim(explodedTitle[2]);
        var explodedCityInfos = cityInfos.split(',');
    //
    //    $lInfoLast1 = trim($lExplodedCityInfos[count($lExplodedCityInfos)-1]);
    //
    //    if ( count($lExplodedCityInfos) >= 3 )
    //    {
    //        $lInfoLast2 = trim($lExplodedCityInfos[count($lExplodedCityInfos)-2]);
    //        $lInfoLast3 = trim($lExplodedCityInfos[count($lExplodedCityInfos)-3]);
    //
    //        $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
    //        ->getCitiesFromCodeAndName($lInfoLast1,strtoupper($lInfoLast2));
    //        if ( count($lCities) != 1)
    //        {
    //            $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
    //            ->getCitiesFromCodeAndName($lInfoLast1,strtoupper($lInfoLast3));
    //        }
    //        if ( count($lCities) != 1)
    //        {
    //            $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
    //            ->findByUppercaseName(strtoupper($lInfoLast1));
    //        if ( count($lCities) != 1)
    //        {
    //            $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
    //            ->getCitiesFromCodeAndDivision($lInfoLast1,strtoupper($lInfoLast2));
    //
    //            //we take the first one event if the result is not precise
    //            if ( count($lCities))
    //                $lCities = array($lCities[0]);
    //        }
    //    }else{
    //        $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
    //        ->findByUppercaseName(strtoupper($lInfoLast1));
    //    }
    //
    //    if ( count($lCities) == 1)
    //    {
    //        $lCity = $lCities[0];
    //        if (is_null($this->mCurrentLatLng))
    //            $this->mCurrentLatLng = array("lat" => $lCity->getLatitude() , "lng" => $lCity->getLongitude());
    //
    //    }
    }

    return city;
};

module.exports = RightmoveExtractorCommand;