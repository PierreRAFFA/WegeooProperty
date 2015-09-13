'use strict';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// DEPENDENCIES
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var http = require('http');

var mongoose = require('mongoose');
require('../models/classified.server.model');
var Classified = mongoose.model('Classified');

var Crawler = require('crawler');

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// CONSTRUCTOR
function ExtractorCommand() {

    this.numClassifiedsAdded         = 0;
    this.numClassifiedsFound         = 0;
    this.numClassifiedsAlreadyExists = 0;

    this.rssUrls            = [];
    this.rssItems           = [];
    this.currentCategory    = '';
    this.crawler            = null;
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
            {
                xml += chunk;
            }
        });
        res.on('end', function(){

            parser.parseString(xml.substring(0, xml.length), function (err, json) {
                //console.dir(json.rss.channel[0].item.length);
                self.rssItems = self.getItems(json);

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
//////////////////////////////////////////////////////////////////////////////////// PARSE ITEM
ExtractorCommand.prototype.parseNextItem = function()
{
    console.log('this.rssItems.length:' + this.rssItems.length);

    if ( this.rssItems.length)
    {
        var item = this.rssItems.shift();
        this.parseItem(item);
    }else{
        this.displayResult();
    }
};

ExtractorCommand.prototype.parseItem = function(item)
{
    var self = this;

    this.numClassifiedsFound++;

    //get reference
    var reference = this.getItemReference(item);

    console.log('reference:' + reference);

    if (reference)
    {
        //check if reference already exists.
        Classified.findOne({reference:reference},
            function(err, classified) {
                if (err){
                    self.error('Error when trying to get classifieds by reference');
                }else{
                   if(classified){
                       self.numClassifiedsAlreadyExists++;
                   }else{

                       self.crawlLink(item);
                   }
                }
        });
    }else{
        this.warn('No Id found.');
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// CRAWLER
ExtractorCommand.prototype.crawlLink = function(item)
{
    var self = this;

    var url = this.getItemLink(item);

    console.log('Crawling "' + url + '" ...');
    var c = new Crawler({
        maxConnections : 10,
        callback : function(error, result, $){
            self.onLinkCrawled(error, result, $, function()
            {
                self.parseItem2(item);
            });
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
ExtractorCommand.prototype.parseItem2 = function(item)
{
    var city = this.getCity(item);
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// ITEM PROPERTIES
ExtractorCommand.prototype.getItemReference = function(item)
{
    return '';
    //return 'wg-e98db88df';
};
ExtractorCommand.prototype.getItemLink = function(item)
{
    return '';
};
ExtractorCommand.prototype.getCity = function(item)
{
    return null;
};
///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////// RESULT
ExtractorCommand.prototype.displayResult = function()
{
    //log result
    this.notice('===============================================');
    if ( this.numClassifiedsFound)
    {
        this.notice('RESULT: '+this.numClassifiedsAdded+'/'+ this.numClassifiedsFound +' classified(s) added (' + this.numClassifiedsAdded / this.numClassifiedsFound * 100 + '%)');
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