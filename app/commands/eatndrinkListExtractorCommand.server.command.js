'use strict';

var ExtractorCommand = require('./extractorCommand.server.command');
var _ = require('lodash');

var mongoose = require('mongoose');
var City = mongoose.model('City');
var Contact = mongoose.model('Contact');
var Crawler = require('crawler');
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// CONSTRUCTOR
function EatndrinkExtractorListCommand() {

    ExtractorCommand.call(this);
    ExtractorCommand.DEBUG = true;

    this.logo = null;
}
EatndrinkExtractorListCommand.prototype = Object.create( ExtractorCommand.prototype);
EatndrinkExtractorListCommand.prototype.constructor = EatndrinkExtractorListCommand;
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// REGISTER URLS
EatndrinkExtractorListCommand.prototype.registerUrls = function(shellParams)
{
    var baseURL = 'https://www.list.co.uk/places/what:restaurant/page:{0}/#results';

    for(var i = 1 ; i < 80 ; i++)
    {
        this.urls.push({url:baseURL.replace('{0}', i.toString() ), category: 'restaurant' , type:'webpage'});
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// GET ITEMS
EatndrinkExtractorListCommand.prototype.getItemsFromCrawler = function(result, $)
{
    var items = [];
    $('div.placeSummary').each( function(index, placeSummary)
    {
        var href = $(placeSummary).find('a')['0'].attribs.href;
        if ( href.substring(0,2) === '//')
        {
            href = 'https:' + href;
        }else{
            href = 'https://www.list.co.uk' + href;
        }

        var name = $(placeSummary).find('h2.head')['0'].children[0].data;
        var address = $(placeSummary).find('address')['0'];

        var streetAddress   = null;
        var locality        = null;
        var region          = null;
        var postcode        = null;

        if ( $(address).find('.street-address').length)
            streetAddress = $(address).find('.street-address')[0].children[0].data;
        if ( $(address).find('.locality').length)
            locality = $(address).find('.locality')[0].children[0].data;
        if ( $(address).find('.region').length)
            region = $(address).find('.region')[0].children[0].data;
        if ( $(address).find('.postal-code').length)
        {
            postcode = $(address).find('.postal-code')[0].children[0].data;

            //remove insecable space
            //postcode = postcode.replace(/\s/g,'');
        }

        items.push({
            href: href,
            name: name,
            address: streetAddress,
            locality: locality,
            region: region,
            postcode: postcode
        });
    });


    //console.dir(items);

    return items;
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// GET ASYNC TASKS
EatndrinkExtractorListCommand.prototype.getAsyncTasks = function(item)
{
    var self = this;

    var asyncTasks = ExtractorCommand.prototype.getAsyncTasks.call(this,item);
    return asyncTasks;
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// CRAWLER
EatndrinkExtractorListCommand.prototype.onLinkCrawled = function(error, result, $, callback)
{
    var self = this;

    //latitude
    var latitudeSpan = $('span.latitude > span');
    if ( latitudeSpan.length)
        this.currentClassified.latitude = latitudeSpan[0].attribs.title;

    //longitude
    var longitudeSpan = $('span.longitude > span');
    if ( longitudeSpan.length)
        this.currentClassified.longitude = longitudeSpan[0].attribs.title;

    //consider to be geolocalized
    this.currentClassified.geolocalized = true;

    //telephone
    var telSpan = $('li.tel > span');
    if ( telSpan.length)
        this.currentContact.phone = telSpan[0].children[0].data;

    //website + website crawling
    var websiteSpan = $('ul.contact a.url');
    if ( websiteSpan.length)
    {
        this.currentContact.website = websiteSpan[0].attribs.href;
        var c = new Crawler({
            maxConnections : 10,
            timeout: 10000,
            callback : function(error, result, $){
                self.onWebsiteCrawled(error, result, $, function()
                {
                    return callback(null,true);
                });
            }
        });
        console.log('crawl website: ' + this.currentContact.website);
        c.queue(this.currentContact.website);
    }else{
        return callback(null,true);
    }
};
EatndrinkExtractorListCommand.prototype.onWebsiteCrawled = function(error, result, $, callback)
{
    if (result && result.body && $)
    {
        //description
        var descriptionHTMLs = $('meta[name=description]');
        if ( descriptionHTMLs.length)
        {
            this.currentClassified.description = descriptionHTMLs.attr('content');
        }

        //logo ( NOT DONE )
        var logoHTMLs = $('.logo');
        if (logoHTMLs.length)
        {
            console.dir($(logoHTMLs[0]));
            console.dir($(logoHTMLs[0]).css('background-image'));
            console.dir($(logoHTMLs).css('width'));
        }

        //email
        var body = result.body;
        var regexp = /([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g;
        var matches = regexp.exec(body);
        if ( matches && matches.length > 1)
        {
            this.currentContact.email = matches[1];
        }
    }else{
        console.log('Can not crawl the website');
        if (result)
            console.log(result.client._httpMessage._header);
    }


    callback.call(null);

};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// GETTER
EatndrinkExtractorListCommand.prototype.getItemReference = function(item)
{
    var reference = null;

    var regexp = /\/place\/([0-9]*)/g;
    var matches = regexp.exec(item.href);
    if ( matches.length > 1)
    {
        reference = matches[1];
    }
    return reference;
};
EatndrinkExtractorListCommand.prototype.getItemLink = function(item)
{
    //var link = 'https://www.list.co.uk/place/103688-el-barrio/';
    var link = item.href;
    return link;
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// REGISTER DATA
EatndrinkExtractorListCommand.prototype.registerReference = function(item, callback)
{
    this.currentClassified.reference = this.getItemReference(item);
    return callback(null, true);
};

EatndrinkExtractorListCommand.prototype.registerLink = function(item, callback)
{
    this.currentClassified.reference = this.getItemLink(item);
    return callback(null, true);
};
EatndrinkExtractorListCommand.prototype.registerContact = function(item, callback)
{
    var self = this;

    console.log('registerContact');
    this.currentContact.name        = _.trim(item.name);
    this.currentContact.address     = _.trim(item.address);
    this.currentContact.postcode    = _.trim(item.postcode);
    this.currentContact.city        = _.trim(item.locality);

    var clauses = {};
    var contactDoc = this.currentContact._doc;
    for(var key in contactDoc)
    {
        if ( key === '_id') continue;
        clauses[key] = contactDoc[key];
    }

    Contact.getOrCreate(clauses, function(contact)
    {
        self.currentClassified.contact = contact;
        self.currentClassified.nContact = {name: contact.name, address: contact.address};
        return callback(null,contact !== null);
    });
};
EatndrinkExtractorListCommand.prototype.registerTitle = function(item, callback)
{
    console.log('registerTitle');

    this.currentClassified.title = _.trim(item.name);
    return callback(null, true);
};
EatndrinkExtractorListCommand.prototype.registerDescription = function(item, callback)
{
    console.log('registerDescription');
    //already done by the crawler
    return callback(null, true);
};
EatndrinkExtractorListCommand.prototype.registerCity = function(item, callback)
{
    console.log('registerCity');
    var self = this;

    if (item.locality && item.postcode)
    {
        var cityName = item.locality.toUpperCase();
        var postcode = item.postcode;

        var splittedPostcode = postcode.split(' '); //carefull here, this is not a normal space, but probably an non-break space
        console.log(postcode);
        if (splittedPostcode.length === 2 ) {
            postcode = splittedPostcode[0];
        }else if (splittedPostcode.length === 3 ){
            postcode = splittedPostcode[0] + splittedPostcode[1];
        }


        var clauses = { uppercaseName:cityName, postcode: postcode };
        City.findOne(clauses,
            function (err, city) {
                if (err) {
                    self.error('Error when trying to get city');
                    return callback(null, false);
                } else {
                    if (city) {

                        self.currentClassified.nCity = {
                            slugName: city.slugName,
                            parentCode: city.parentCode,
                            postcode: city.postcode,
                            name: city.name
                        };

                        return callback(null, true);
                    }else{
                        console.log('No city found with postcode:' + postcode + ' and uppercaseName:' + cityName);
                        return callback(null, false);
                    }
                }
            }
        );
    }else{
        console.log('No locality found');
        return callback(null, false);
    }

};
EatndrinkExtractorListCommand.prototype.registerCreationDate = function(item, callback)
{
    console.log('registerCreationDate');
    this.currentClassified.creationDate = new Date().toUTCString();
    return callback(null, true);
};
EatndrinkExtractorListCommand.prototype.registerCountryCode = function(item, callback)
{
    console.log('registerCountryCode');
    this.currentClassified.countryCode = 'GB';
    return callback(null, true);
};

module.exports = EatndrinkExtractorListCommand;