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
var Contact = mongoose.model('Contact');


var Crawler = require('crawler');

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// CONSTRUCTOR
function ExtractorCommand() {

    this.params = null;
    this.numClassifiedsAdded         = 0;
    this.numClassifiedsFound         = 0;
    this.numClassifiedsAlreadyExists = 0;

    this.urls            = [];
    this.items           = [];
    this.mainLogo            = '';
    this.currentCategory    = '';
    this.crawler            = null;
    this.currentClassified  = null;
    this.currentContact     = null;

}
ExtractorCommand.DEBUG = false;
ExtractorCommand.GOOGLE_GEOCODE_URL = 'http://maps.google.com/maps/api/geocode/json?sensor=false&address=%s';
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// EXECUTE
ExtractorCommand.prototype.execute = function() {

    console.log('categories:' + arguments);

    this.registerUrls(arguments);

    this.parseNextUrls();
};

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////  PARSE NEXT URL
ExtractorCommand.prototype.parseNextUrls = function()
{
    console.log('this.urls.length:' + this.urls.length);

    if ( this.urls.length)
    {
        var url = this.urls.shift();
        this.parseUrl(url.url,url.category,url.type);
    }else{
        this.displayResult();
    }

};
/**
 * Download the rss, then parses
 * @param url
 * @param category
 */
ExtractorCommand.prototype.parseUrl = function(url, category,type)
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
    if ( type === null || type === 'rss')
    {
        var request = http.get(url, function(res) {
            var content = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {

                if (chunk)
                    content += chunk;
            });
            res.on('end', function(){

                parser.parseString(content.substring(0, content.length), function (err, json) {
                    self.items = self.getItems(json);
                    self.mainLogo = self.getMainLogo(json);

                    self.parseNextItem();
                });

            });
        });
    }else if (type === null || type === 'webpage')
    {
        console.log('begin crawl');
        var c = new Crawler({
            maxConnections : 1,
            callback : function(error, result, $){
                console.log('end crawl');
                self.items = self.getItemsFromCrawler(result,$);
                console.dir(self.items);
                self.parseNextItem();
            }
        });
        c.queue(url);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// CRAW URL
ExtractorCommand.prototype.crawlUrl = function(error, result, $)
{
    return [];
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
ExtractorCommand.prototype.getItemsFromCrawler = function(result,$)
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
ExtractorCommand.prototype.getMainLogo = function(rss)
{
    return '';
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// PARSE ITEM
ExtractorCommand.prototype.parseNextItem = function()
{
    //console.log('this.items.length:' + this.items.length);

    if ( this.items.length)
    {
        var item = this.items.shift();
        this.parseItem(item);
    }else{
        this.displayResult();
        this.parseNextUrls();
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
        this.currentClassified = new Classified();
        this.currentContact = new Contact();

        //check if reference already exists.
        //console.log('reference:' + reference);

        Classified.findOne({reference:reference},
            function(err, classified) {
                if (err){
                    self.error('Error when trying to get classifieds by reference');
                }else{

                   if(classified){
                       console.log('classified found => go to the next');
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

    var asyncTasks = this.getAsyncTasks(item);

    async.series(asyncTasks ,
        function(err, results) {
            // results is now equal to: {one: 1, two: 2}
            //console.dir(results);
            console.log('onAsyncFinished:');
            console.dir(results);
            self.createClassified();
        }
    );
};
ExtractorCommand.prototype.getAsyncTasks = function(item)
{
    var self = this;

    return {
        crawlerInfos: function (callback) {
            self.crawlLink(item, callback);
        },
        contact: function (callback) {
            self.registerContact(item, callback);
        },
        title: function (callback) {
            self.registerTitle(item, callback);
        },
        description: function (callback) {
            self.registerDescription(item, callback);
        },
        link: function (callback) {
            self.registerLink(item, callback);
        },
        reference: function (callback) {
            self.registerReference(item, callback);
        },
        city: function (callback) {
            self.registerCity(item, callback);
        },
        creationDate: function (callback) {
            self.registerCreationDate(item, callback);
        },
        countryCode: function (callback) {
            self.registerCountryCode(item, callback);
        }
    };
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
ExtractorCommand.prototype.createClassified = function()
{
    var self = this;

    if ( this.isValid()) {

        console.log('save');
        //console.dir(this.currentClassified);
        //console.dir(this.currentContact);

        this.currentClassified.active = true;
        this.currentClassified.clientIp = 'REMOTE_ADDR';
        this.currentClassified.modificationDate = new Date().toUTCString();
        //this.currentClassified.external = true;
        this.currentClassified.category = this.currentCategory;

        this.currentClassified.save(function (err) {

            console.log('on Save:' + self.currentClassified.reference);
            if (err) {
                console.log('Error when trying to save the classified');
                console.dir(err);
            } else {

                console.log('SAAAAAVVVVEEEEED ' + self.currentClassified.reference);
                self.numClassifiedsAdded++;
                self.parseNextItem();
            }
        });

        ////console.dir('contact:' + infos.contact);
        //if ( infos.currentClassified.contact && infos.currentClassified.contact.logo)
        //    infos.contact.logo = infos.currentClassified.contact.logo;
        //
        ////process.exit();
        //
        //var details = {};
        //if (infos.currentClassified.price)
        //    details.price = infos.currentClassified.price;
        //if (infos.currentClassified.weekPrice)
        //    details.weekPrice = infos.currentClassified.weekPrice;
        //if (infos.currentClassified.monthPrice)
        //    details.monthPrice = infos.currentClassified.monthPrice;
        //if (infos.propertyType)
        //    details.propertyType = infos.propertyType;
        //
        //
        //classified.reference = infos.reference;
        //console.log('createClassified with reference:' + classified.reference);
        //classified.active = true;
        //classified.external = true;
        //classified.externalLink = infos.link;
        //classified.externalLogo = this.mainLogo;
        //classified.category = this.currentCategory;
        //classified.clientIp = 'REMOTE_ADDR';
        //classified.contactType = '1';
        //classified.contact = infos.contact;
        //classified.nContact = {name: infos.contact.name, address: infos.contact.address};
        //classified.creationDate = infos.creationDate;
        ////classified.modificationDate = Date.now;
        //classified.title = infos.title;
        //classified.description = infos.description;
        //classified.details = details;
        //classified.countryCode = infos.countryCode;
        //classified.latitude = infos.currentClassified.latitude;
        //classified.longitude = infos.currentClassified.longitude;
        //classified.medias = infos.currentClassified.medias;
        //classified.geolocalized = true;
        //
        //if ( infos.city )
        //{
        //    console.log('city !!');
        //    classified.nCity = {
        //        slugName:infos.city.slugName,
        //        parentCode: infos.city.parentCode,
        //        postcode: infos.city.postcode,
        //        name: infos.city.name
        //    };
        //}
        //console.dir(classified);
        //process.exit();
        //
        //classified.save(function (err) {
        //
        //    console.log('on Save:' + classified.reference);
        //    if (err) {
        //        console.log('Error when trying to save the classified');
        //        console.dir(err);
        //    } else {
        //
        //        console.log('SAAAAAVVVVEEEEED ' + classified.reference);
        //        self.numClassifiedsAdded++;
        //        self.parseNextItem();
        //    }
        //});
    }else{
        self.parseNextItem();
    }
};
/**
 * Last check before saving the classified
 *
 * @param infos
 * @returns {boolean}
 */
ExtractorCommand.prototype.isValid = function()
{
    return true;
};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// ITEM PROPERTIES
ExtractorCommand.prototype.getItemReference = function(item,callback)
{
    return '';
    //return 'wg-e98db88df';
};
ExtractorCommand.prototype.registerReference = function(item,callback)
{
    return '';
    //return 'wg-e98db88df';
};
ExtractorCommand.prototype.registerTitle = function(item, callback)
{
    return '';
};
ExtractorCommand.prototype.registerDescription = function(item, callback)
{
    return '';
};
ExtractorCommand.prototype.getItemLink = function(item)
{
    return '';
};
ExtractorCommand.prototype.registerLink = function(item, callback)
{
    return '';
};
ExtractorCommand.prototype.registerCity = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.registerContact = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.registerCountryCode = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.getItemPropertyType = function(item, callback)
{
    return null;
};
ExtractorCommand.prototype.registerCreationDate = function(item, callback)
{
    this.currentClassified.creationDate = new Date(item.pubDate[0]).toUTCString();
    return callback(null, true);
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