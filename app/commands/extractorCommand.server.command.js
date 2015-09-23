'use strict';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// DEPENDENCIES
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var http = require('http');
var moment = require('moment');
var async = require('async');

var mongoose = require('mongoose');
require('../models/classified.server.model');
require('../models/city.server.model');
require('../models/contact.server.model');
var Classified = mongoose.model('Classified');
var City = mongoose.model('City');


var Crawler = require('crawler');

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// CONSTRUCTOR
function ExtractorCommand() {

    this.numClassifiedsAdded         = 0;
    this.numClassifiedsFound         = 0;
    this.numClassifiedsAlreadyExists = 0;

    this.rssUrls            = [];
    this.rssItems           = [];
    this.rssLogo            = '';
    this.currentCategory    = '';
    this.crawler            = null;
    this.crawlerInfos       = null;
}
ExtractorCommand.DEBUG = false;
ExtractorCommand.GOOGLE_GEOCODE_URL = 'http://maps.google.com/maps/api/geocode/json?sensor=false&address=%s';
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// EXECUTE
ExtractorCommand.prototype.execute = function(categories) {

    console.log('categories:' + categories);


    //sale
    if ( categories === null || categories === 'both' || categories === 'sale')
    {
        this.registerSaleRss();
    }

    //rent
    if ( categories === null || categories === 'both' || categories === 'rent')
    {
        this.registerRentRss();
    }

    this.parseNextRss();
};

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////  BUILD URLS
/**
 * These methods create all the rss url depending on the extractor.
 * That's why these methods have to be overrided by specific rss extractors.
 */
ExtractorCommand.prototype.registerSaleRss = function()
{
   console.log('Registering Sale Classifieds Rss...');
};
ExtractorCommand.prototype.registerRentRss = function()
{
    console.log('Registering Rent Classifieds Rss...');
};
///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////  PARSE NEXT URL
ExtractorCommand.prototype.parseNextRss = function()
{
    console.log('this.rssUrls.length:' + this.rssUrls.length);

    if ( this.rssUrls.length)
    {
        var rss = this.rssUrls.shift();
        this.parseRss(rss.url,rss.category);
    }else{
        this.displayResult();
    }

};
/**
 * Download the rss, then parses
 * @param url
 * @param category
 */
ExtractorCommand.prototype.parseRss = function(url, category)
{
    var self = this;

    //init
    this.currentCategory = category;
    this.numClassifiedsAdded = 0;
    this.numClassifiedsFound = 0;
    this.numClassifiedsAlreadyExists = 0;

    //log
    console.log('Downloading from "' + url + '"...');

    //download
    var request = http.get(url, function(res) {
        var xml = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {

            if (chunk)
                xml += chunk;
        });
        res.on('end', function(){

            parser.parseString(xml.substring(0, xml.length), function (err, json) {
                //console.dir(json.rss.channel[0].item.length);
                self.rssItems = self.getItems(json);
                self.rssLogo = self.getRssLogo(json);

                self.parseNextItem();
            });
        });
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// PARSE ITEMS
/**
 * The parsing depends on the structure of the rss
 * That's why this method has to be overrided by specific rss extractors.
 * @param rss
 * @param category
 */
ExtractorCommand.prototype.getItems = function(rss)
{
    return [];
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// GET RSS LOGO
/**
 * The parsing depends on the structure of the rss
 * That's why this method has to be overrided by specific rss extractors.
 * @param rss
 * @param category
 */
ExtractorCommand.prototype.getRssLogo = function(rss)
{
    return '';
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// PARSE ITEM
ExtractorCommand.prototype.parseNextItem = function()
{
    //console.log('this.rssItems.length:' + this.rssItems.length);

    if ( this.rssItems.length)
    {
        var item = this.rssItems.shift();
        this.parseItem(item);
    }else{
        this.displayResult();
        this.parseNextRss();
    }
};

ExtractorCommand.prototype.parseItem = function(item)
{
    var self = this;

    this.numClassifiedsFound++;

    //get reference
    var reference = this.getItemReference(item);

    //console.log('reference:' + reference);

    if (reference)
    {
        //check if reference already exists.
        //console.log('reference:' + reference);

        Classified.findOne({reference:reference},
            function(err, classified) {
                if (err){
                    self.error('Error when trying to get classifieds by reference');
                }else{

                   if(classified){
                       //console.log('classified found => go to the next');
                       self.numClassifiedsAlreadyExists++;

                       self.parseNextItem();
                   }else{
                       //console.log('classified not found => creation');
                       self.doParseItem(item);

                   }
                }
        });
    }else{
        this.warn('No Reference found.');
        self.parseNextItem();
    }
};
ExtractorCommand.prototype.doParseItem = function(item)
{
    var self = this;

    async.series({

            crawlerInfos: function(callback){
                self.crawlLink(item,callback);
            },
            contact:function(callback){
                self.getItemContact(item, callback);
            },
            title: function(callback){
                self.getItemTitle(item,callback);
            },
            description: function(callback){
                self.getItemDescription(item,callback);
            },
            link: function(callback){
                self.getItemLink(item,callback);
            },
            reference:function(callback){
                self.getItemReference(item,callback);
            },
            city: function(callback){
                self.getItemCity(item, callback);
            },

            creationDate: function(callback){
                self.getItemCreationDate(item, callback);
            },
            countryCode: function(callback){
                self.getItemCountryCode(item, callback);
            },
            propertyType: function(callback){
                self.getItemPropertyType(item, callback);
            }

        },
        function(err, results) {
            // results is now equal to: {one: 1, two: 2}
            //console.dir(results);
            console.log('onAsyncFinished:' + results.reference);
            self.createClassified(results);
        }
    );
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// CRAWLER
ExtractorCommand.prototype.crawlLink = function(item,callback)
{
    var self = this;

    var url = this.getItemLink(item);

    console.log('Crawling "' + url + '" ...');
    var c = new Crawler({
        maxConnections : 10,
        callback : function(error, result, $){
            self.onLinkCrawled(error, result, $, callback);
        }
    });

    c.queue(url);
};

ExtractorCommand.prototype.onLinkCrawled = function(error, result, $, callback)
{
    console.log('onLinkCrawled');
};
///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
ExtractorCommand.prototype.createClassified = function(infos)
{
    var self = this;

    if (infos)
    {
        if ( infos.crawlerInfos.hasOwnProperty('price')) {

            //console.dir('contact:' + infos.contact);
            if ( infos.crawlerInfos.contact && infos.crawlerInfos.contact.logo)
                infos.contact.logo = infos.crawlerInfos.contact.logo;

            //process.exit();

            var details = {};
            if (infos.crawlerInfos.price)
                details.price = infos.crawlerInfos.price;
            if (infos.crawlerInfos.weekPrice)
                details.weekPrice = infos.crawlerInfos.weekPrice;
            if (infos.crawlerInfos.monthPrice)
                details.monthPrice = infos.crawlerInfos.monthPrice;
            if (infos.propertyType)
                details.propertyType = infos.propertyType;


            var classified = new Classified();
            classified.reference = infos.reference;
            console.log('createClassified with reference:' + classified.reference);
            classified.active = true;
            classified.external = true;
            classified.externalLink = infos.link;
            classified.externalLogo = this.rssLogo;
            classified.category = this.currentCategory;
            classified.clientIp = 'REMOTE_ADDR';
            classified.contactType = '1';
            classified.contact = infos.contact;
            classified.nContact = {name: infos.contact.name, address: infos.contact.address};
            classified.creationDate = infos.creationDate;
            //classified.modificationDate = Date.now;
            classified.title = infos.title;
            classified.description = infos.description;
            classified.details = details;
            classified.countryCode = infos.countryCode;
            classified.latitude = infos.crawlerInfos.latitude;
            classified.longitude = infos.crawlerInfos.longitude;
            classified.medias = infos.crawlerInfos.medias;
            classified.geolocalized = true;

            if ( infos.city )
            {
                console.log('city !!');
                classified.nCity = {
                    slugName:infos.city.slugName,
                    parentCode: infos.city.parentCode,
                    postcode: infos.city.postcode,
                    name: infos.city.name
                };
            }
            //console.dir(classified);

            classified.save(function (err) {

                console.log('on Save:' + classified.reference);
                if (err) {
                    console.log('Error when trying to save the classified');
                    console.dir(err);
                } else {

                    console.log('SAAAAAVVVVEEEEED ' + classified.reference);
                    self.numClassifiedsAdded++;
                    self.parseNextItem();
                }
            });
        }else{
            self.parseNextItem();
        }
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// ITEM PROPERTIES
ExtractorCommand.prototype.getItemReference = function(item,callback)
{
    return '';
    //return 'wg-e98db88df';
};
ExtractorCommand.prototype.getItemTitle = function(item, callback)
{
    return '';
};
ExtractorCommand.prototype.getItemDescription = function(item, callback)
{
    return '';
};
ExtractorCommand.prototype.getItemLink = function(item, callback)
{
    return '';
};
ExtractorCommand.prototype.getItemCity = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.getItemContact = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.getItemCountryCode = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.getItemPropertyType = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.getItemCreationDate = function(item, callback)
{
    return callback(null, new Date(item.pubDate[0]).toUTCString());
};
///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////// RESULT
ExtractorCommand.prototype.displayResult = function()
{
    //log result
    this.notice('===============================================');
    if ( this.numClassifiedsFound)
    {
        this.notice('RESULT: '+this.numClassifiedsAdded +'/'+ this.numClassifiedsFound +' classified(s) added (' + this.numClassifiedsAdded / this.numClassifiedsFound * 100 + '%)');
        this.notice('        ' + this.numClassifiedsAlreadyExists + '/' + this.numClassifiedsFound + ' classified(s) already exists (' + this.numClassifiedsAlreadyExists / this.numClassifiedsFound * 100 + '%)');
    }else{
        this.notice('RESULT: 0 classified found in the rss');
    }
    this.notice('===============================================');
};
///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////// OUTPUT
ExtractorCommand.prototype.notice = function(message)
{
    console.log('NOTICE: ' + message);
};
ExtractorCommand.prototype.warn = function(message)
{
    console.log('WARNING: ' + message);
};
ExtractorCommand.prototype.error = function(message)
{
    console.log('ERROR: ' + message);
};

module.exports = ExtractorCommand;