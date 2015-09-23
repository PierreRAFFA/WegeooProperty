'use strict';

var ExtractorCommand = require('./extractorCommand.server.command');
var _ = require('lodash');

var mongoose = require('mongoose');
var City = mongoose.model('City');
var Contact = mongoose.model('Contact');

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// CONSTRUCTOR
function RightmoveExtractorCommand() {

    ExtractorCommand.call(this);
    ExtractorCommand.DEBUG = true;

    this.logo = null;
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
    //remove
    if (rss)
    {
        return rss.rss.channel[0].item.splice(0, rss.rss.channel[0].item.length - 3);
    }else{
        return [];
    }

};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// GET RSS LOGO
ExtractorCommand.prototype.getRssLogo = function(rss)
{
    if (rss)
    {
        return rss.rss.channel[0].image[0].url[0];
    }else{
        return [];
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// CRAWLER
RightmoveExtractorCommand.prototype.onLinkCrawled = function(error, result, $, callback)
{
    var self = this;

    var crawlerInfos = {};
    crawlerInfos.details = {};

    //latitude and longitude
    var matches = result.body.match(/"latitude":([-\.0-9]*),"longitude":([-\.0-9]*)/);
    if (matches.length > 2)
    {
        crawlerInfos.latitude = parseFloat(matches[1]);
        crawlerInfos.longitude = parseFloat(matches[2]);
    //}else{

        //If no geolocalion is found, we can ignore this item and parse the next one.
        //this.parseNextItem();
        //return;
    }

    //external media
    var regex = /<a target="_blank" rel="nofollow" href="[&=?\-:/._a-zA-Z0-9]*"><img src="([\-:/._a-zA-Z0-9]*)"/g;
    var medias = [];
    while ((matches = regex.exec(result.body)) !== null) {
        medias.push(matches[1]);
    }
    crawlerInfos.medias = medias;

    //price
    $('p[id=\'propertyHeaderPrice\'] > strong').each( function(index, price)
    {
        //console.dir(price.children.length);

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
                crawlerInfos.price = parseFloat(matches[1]);
            }
        }else if ( self.currentCategory === 'rent')
        {
            if ( wholePrice.indexOf('POA') >= 0)
            {
                crawlerInfos.weekPrice     = -1;
                crawlerInfos.monthPrice    = -1;
                crawlerInfos.price         = -1;
            }else{
                matches = wholePrice.match(/£([,0-9]+) pw.*£([,0-9]+) pcm/);

                if ( matches === null)
                {
                    console.dir('problem with the price:' + wholePrice);
                    //process.exit();
                }
                if ( matches && matches.length > 2)
                {
                    crawlerInfos.weekPrice     = parseFloat(matches[1]);
                    crawlerInfos.monthPrice    = parseFloat(matches[2]);
                    crawlerInfos.price         = crawlerInfos.monthPrice;
                }

            }
        }

        crawlerInfos.currency = '&pounds;';

        //contact logo
        $('a.agent-details-agent-logo > img').each(function(index, img)
        {
            crawlerInfos.contact = {logo: img.attribs.src};
        });

        //contact address
        $('#secondaryContent .agent-details-display address').each(function(index, address)
        {
            var completeAddress = address.children[0].data;
            var exploded = completeAddress.split('\r\n');

            var formattedAddress = '';
            for(var i = 0; i < exploded.length - 2 ; i++)
            {
                formattedAddress += exploded[i];
            }
            crawlerInfos.contact.address = formattedAddress;
            crawlerInfos.contact.city = exploded[exploded.length - 2];
            crawlerInfos.contact.postcode = exploded[exploded.length - 1];
        });

        //contact name
        $('#secondaryContent .agent-details-display #aboutBranchLink strong').each(function(index, contactName)
        {
            crawlerInfos.contact.name = contactName.children[0].data;
        });
    });

    //availability
    //console.log($('#lettingInformation tbody td > strong').length);

    $('#lettingInformation tbody > tr > td > strong').each( function(index, information)
    {
        //info name
        var infoName = _.trim(information.children[0].data);

        //info value
        var parent = information.parent.parent;
        var valueNode = parent.children[parent.children.length - 2];
        var infoValue = valueNode.children[0].data;


        switch(infoName){
            case 'Furnishing:':
                crawlerInfos.details.furnishing = infoValue.toLowerCase();
                break;
            case 'Date available:':
                crawlerInfos.details.availability = infoValue;
                break;
            case 'Letting type:':
                crawlerInfos.details.lettingType = infoValue;
                break;
            case 'Deposit:':
                infoValue = infoValue.replace(',' , '');
                var matches = infoValue.match(/([0-9]*)/);
                if ( matches.length > 1)
                    crawlerInfos.details.deposit = matches[1];
                break;

            case 'Reduced on Rightmove:':
            case 'Added on Rightmove:':
                break;

            default:
                console.log('The details "' + infoName + '" with value "' + infoValue + '" has been ignored.');
        }
    });

    //console.dir(crawlerInfos);

    //process.exit();

    this.crawlerInfos = crawlerInfos;
    return callback(null, crawlerInfos);

};
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////// ITEM PROPERTIES
RightmoveExtractorCommand.prototype.getItemReference = function(item, callback)
{
    var reference = null;

    var guid = item.guid[0];
    if ( typeof guid === 'object')
        guid = guid._;

    var matches = guid.match(/property-([0-9]*).html/);
    if ( matches && matches.length > 1)
        reference = RightmoveExtractorCommand.PREFIX + matches[1];

    if ( callback)
        return callback(null, reference);
    else
        return reference;
};
RightmoveExtractorCommand.prototype.getItemTitle = function(item, callback)
{
    var title = item.title[0];
    title = title.replace(/\n/g , ' ');
    title = title.replace(/\t/g , ' ');

    var exploded = title.split(':');

    if (exploded.length === 3)
        title = _.trim(exploded[1]) + ', ' + _.trim(exploded[2]);

    if ( callback)
        return callback(null, title);
    else
        return title;

};
RightmoveExtractorCommand.prototype.getItemDescription = function(item, callback)
{
    if ( callback)
        callback(null, item.description[0]);
    else
        return item.description[0];
};
RightmoveExtractorCommand.prototype.getItemLink = function(item, callback)
{
    if ( callback)
        return callback(null, item.link[0]);
    else
        return item.link[0];

};
RightmoveExtractorCommand.prototype.getItemCountryCode = function(item, callback)
{
    if ( callback)
        return callback(null, 'GB');
    else
        return 'GB';

};
RightmoveExtractorCommand.prototype.getItemPropertyType = function(item, callback)
{
    var propertyType = null;
    switch(item.category[0].toLowerCase())
    {
        case 'apartment':
        case 'flat share':
        case 'studio apartment':
        case 'ground floor flat':
        case 'flat':
        case 'duplex':
        case 'studio flat':
            propertyType = 'apartment';
            break;

        case 'house':
        case 'park home':
        case 'guest house':
        case 'villa':
        case 'penthouse':
        case 'mews house':
        case 'link detached house':
        case 'detached villa':
        case 'chalet':
        case 'town house':
        case 'cluster house':
        case 'property':
        case 'character property':
        case 'retirement property':
        case 'cottage':
        case 'detached house':
        case 'semi-detached house':
        case 'semi-detached villa':
        case 'end of terrace house':
        case 'maisonette':
        case 'house share':
        case 'country house':
        case 'stone house':
        case 'terraced house':
        case 'coach house':
        case 'ground maisonette':
        case 'house of multiple occupation':
        case 'sheltered housing':
            propertyType = 'house';
            break;

        case 'commercial property':
        case 'heavy industrial':
        case 'light industrial':
            propertyType = 'commercial-space';
            break;

        case 'bungalow':
        case 'terraced bungalow':
        case 'mobile home':
        case 'farm house':
        case 'detached bungalow':
        case 'semi-detached bungalow':
        case 'barn conversion':
        case 'residential development':
        case 'farm':
        case 'serviced apartment':
        case 'showroom':
        case 'equestrian facility':
        case 'healthcare facility':
        case 'warehouse':
        case 'lodge':
        case 'retail property (high street)':
        case 'smallholding':
        case 'factory':
        case 'farm land':
        case 'convenience store':
        case 'distribution warehouse':
        case 'block of apartments':
        case 'post office':
        case 'bar / nightclub':
        case 'commercial development':
        case 'workshop & retail space':
        case 'hotel room':
            propertyType = 'others';
            break;

        case 'shop':
        case 'restaurant':
        case 'cafe':
        case 'pub':
        case 'mixed use':
            propertyType = 'shop';
            break;

        case 'land':
        case 'plot':
            propertyType = 'land';
            break;

        case 'garage':
        case 'parking':
            propertyType = 'parking';
            break;

        case 'hotel':
            propertyType = 'residential-building';
            break;

        case 'office':
        case 'serviced office':
            propertyType = 'office';
            break;

        default:
            this.warn('The propertyType ' + item.category + ' is unknown');
    }

    return callback(null, propertyType);
};
RightmoveExtractorCommand.prototype.getItemCity = function(item, callback)
{
    var self = this;

    var title = item.title[0];
    title = title.replace(/\n/g , ' ');
    title = title.replace(/\t/g , ' ');

    var explodedTitle = title.split(':');
    if (explodedTitle.length === 3)
    {
        var cityInfos = _.trim(explodedTitle[2]);
        var explodedCityInfos = cityInfos.split(',');

        console.dir(explodedCityInfos);

        var infoLast1 = _.trim(explodedCityInfos[explodedCityInfos.length-1]);

        if ( explodedCityInfos.length >= 3 )
        {
            var infoLast2 = _.trim(explodedCityInfos[explodedCityInfos.length-2]);
            var infoLast3 = _.trim(explodedCityInfos[explodedCityInfos.length-3]);


            //Create all possible clauses to find the city
            var clauses = {
                $or:[
                    { $and: [ { code: infoLast1 }, { name: infoLast2 }]},
                    { $and: [ { code: infoLast1 }, {name: infoLast3.toUpperCase() }]},
                    { $and: [ { uppercaseName: infoLast1.toUpperCase() }]},
                    { $and: [ { code: infoLast1.toUpperCase() }, { division: infoLast2.toUpperCase() }]}
                ]
            };

            //execute the queries until a city is found
            City.findOne(clauses,
                function (err, city) {
                    if (err) {
                        self.error('Error when trying to get city');
                        return callback('Error when trying to get city');
                    } else {
                        if (city) {
                            return callback(null, city._doc);
                        }else{
                            return callback(null, null);
                        }
                    }
                }
            );
        }else{

            City.findOne({uppercaseName: infoLast1.toUpperCase()},
                function(err, city) {
                    if (err){
                        self.error('Error when trying to get city by code/name');
                        return callback('Error when trying to get city by code/name');
                    }else{
                        if(city){
                            return callback(null, city._doc);
                        }else{
                            return callback(null, null);
                        }
                    }
                }
            );
        }
    }else{
        return callback(null, null);
    }
};

RightmoveExtractorCommand.prototype.getItemContact = function(item, callback)
{
    //console.dir('getItemContact');
    var self = this;

    var itemContact = {};
    var description = item.description[0];

    //Contact Phone
    var matches = description.match(/Telephone: ([ 0-9]*)/);

    //this.notice(var_export($lMatches,true));
    if ( matches && matches.length === 2)
    {
        itemContact.phone = matches[1];
    }

    //Contact Name
    matches = description.match(/Marketed By (.*)/);
    if ( matches.length === 2)
    {
        var exploded = matches[1].split(',');

        itemContact.name       = _.trim(exploded[0]);
        if( exploded.length === 2)
        {
            itemContact.address    = _.trim(exploded[1]);
        }
    }else{
        this.warn('No Contact Name in the description');
    }



    //overrided by the crawler
    itemContact.name = _.trim(this.crawlerInfos.contact.name);
    itemContact.address = _.trim(this.crawlerInfos.contact.address);
    itemContact.postcode = _.trim(this.crawlerInfos.contact.postcode);
    itemContact.city = _.trim(this.crawlerInfos.contact.city);

    //itemContact.name = 'ok';
    //itemContact.address = 'ok';
    //itemContact.postcode = 'ok';
    //itemContact.city = 'ok';
    //itemContact.phone = 'ok';

    //console.dir(itemContact);


    Contact.findOne(itemContact,
        function (err, contact) {

            //console.log(err);
            //console.log(contact);
            //console.log(!contact);

            if (err) {
                self.error('Error when trying to get contact');
                console.log('Error when trying to get contact');
            } else {
                if (!contact) {

                    //Create a contact
                    console.log('create a contact');
                    var newContact = new Contact();
                    newContact.name = itemContact.name;
                    newContact.phone = itemContact.phone;
                    newContact.address = itemContact.address;
                    newContact.postcode = itemContact.postcode;
                    newContact.city = itemContact.city;

                    newContact.save(function (err) {
                        if (err) {
                            console.log('Error when trying to save the contact');
                        } else {
                            console.log('contact created');
                            return callback(null, newContact);
                        }
                    });
                } else {
                    console.log('contact found');
                    return callback(null, contact);
                }
            }
        }
    );
};




module.exports = RightmoveExtractorCommand;