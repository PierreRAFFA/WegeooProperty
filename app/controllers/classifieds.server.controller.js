'use strict';

/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Classified = mongoose.model('Classified'),
	City = mongoose.model('City'),
	CityController = require('./city.server.controller'),
	_ = require('lodash');

var sha1 = require('sha1');
var md5 = require('md5');

function generateReference(length, prefix)
{
    var lReference = (prefix  || '') + sha1(String(Math.random())).substring( 0, length);

    //check if reference exists by checking classified storage path
    //$lClassifiedStoragePath = sprintf("/var/www/storage/%s" , $lReference);
    //if ( file_exists($lClassifiedStoragePath))
    //    $lReference = generateReference($pLength, $pPrefix);

    return lReference;
}
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/**
 * Create a classified
 */
exports.create = function(req, res) {

    //get city
    CityController.getCityFromSlugName(req.body.city , function(city)
    {
        console.log(city);

        //delete to prevent crash ( city here is actually the slugName value )
        delete req.body.city;

        var classified = new Classified(req.body);
        classified.reference    = generateReference(8 , 'wg-');
        classified.user         = req.user;
        classified.city         = city;
        classified.nCity        = { slugName: city.slugName , parentCode:city.parentCode };

        classified.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(classified);
            }
        });
    });
};

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/**
 * Show the current classified
 */
exports.read = function(req, res) {
	res.json(req.classified);
};

/**
 * Update a classified
 */
exports.update = function(req, res) {
	var classified = req.classified;

    //@Todo
    //classified.user = req.user;

	classified = _.extend(classified, req.body);

	classified.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(classified);
		}
	});
};

/**
 * Delete an classified
 */
exports.delete = function(req, res) {
	var classified = req.classified;

	classified.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(classified);
		}
	});
};

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////  SELECT CLASSIFIED LIST
/**
 * Returns different results depending on 'list' parameter
 * 'list' can be 'getLatestIn', 'getLatestAround'
 */
exports.list = function(req, res) {
    console.log(req.query);

    if ( req.query.list)
    {
        var lListName = req.query.list;
        switch(lListName)
        {
            case 'cityMostRecent':
                exports._getCityMostRecent(req, res);
                break;

            case 'fromCity':
            case 'fromMapBounds':
                exports._getFromCityOrFromMapBounds(req, res);
                break;

            case 'fromReferences':
                exports._getFromReferences(req, res);
                break;

            default:
                return res.status(400).send({
                    message: 'Incorrect Parameters'
                });
        }
    }else{
        return res.status(400).send({
            message: 'Incorrect Parameters'
        });
    }
};
/**
 * Returns the latest classifieds in a specific city as slugName
 *
 * @param req
 * @param res
 * @private
 */
exports._getCityMostRecent = function (req, res)
{
    if ( req.query.slugName)
    {
        Classified.findMostRecent(req.query.slugName, function(err, classifieds) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                res.json(classifieds);
            }
        });
    }else{
        return res.status(400).send({
            message: 'Incorrect Parameters in _getCityMostRecent List'
        });
    }
};
/**
 * Returns :
 *  - the Classified List from filter
 *  - the city geolocation just the first time of a search
 * This method can be called each time the map position has changed,
 * so there is a filter by reference to avoid sending the references already sent (session)
 *
 * @param req
 * @param res
 * @returns {*}
 * @private
 */
exports._getFromCityOrFromMapBounds = function(req,res)
{
    //compute search id based on all queries except the mapBounds
    var lQuery = _.clone(req.query);
    delete lQuery.mapBounds;
    var lSearchId = md5(lQuery);
    if ( req.session.searchId === undefined || req.session.searchId !== lSearchId)
    {
        //init session variables
        req.session.searchId = lSearchId;
        req.session.references = [];
    }
    if ( req.session.references.length >= 0)
        req.session.references = [];


    if ( req.query.mapBounds || req.query.slugName)
    {
        this._convertQueryToClauses(req , function(clauses, city)
        {
            console.log(JSON.stringify(clauses));

            Classified
                .find(clauses)
                .select('-_id reference latitude longitude modificationDate details.price')
                .sort('-modificationDate')
                .populate('city', '-_id -id -__v -googleLocalized -pop -division -division2')
                .exec(function (err, classifieds) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {

                        var lResponse = {};
                        if ( req.query.slugName && req.session.references.length === 0)
                        {
                            lResponse.city = {latitude:city.latitude, longitude:city.longitude};
                        }

                        //store references in session to prevent to send again these ones when only 'mapBounds' query changed
                        //and remove useless fields ( virtual fields per exemple )
                        var lClassifieds = [];
                        _.forIn(classifieds, function (classified, iC) {
                            req.session.references.push(classified.reference);
                            console.log('store reference:' + classified.reference);

                            classified = classified.toObject();
                            delete classified.url;
                            delete classified.id;

                            lClassifieds.push(classified);
                        });

                        lResponse.classifieds = lClassifieds;

                        res.json([lResponse]);
                    }
                });
        });

    }else{
        return res.status(400).send({
            message: 'Incorrect Parameters in _getFromCityOrFromMapBounds List'
        });
    }
};

exports._getFromReferences = function(req,res)
{

};

/**
 * Returns the 'find' clauses depend on the req.query
 *
 * @param req
 * @param callback
 * @returns {{$and: Array}}
 * @private
 */
exports._convertQueryToClauses = function(req, callback)
{
    //define clauses
    var lClauses = { $and: [] };

    //ignore references already sent
    console.log('req.session.references.length:' + req.session.references.length);
    if (req.session.references.length )
    {
        _.forIn(req.session.references, function(reference, iR)
        {
            var lReference = {reference: {$ne:reference}};
            //lClauses.$and.push(lReference);

            console.log('ignore reference:' + reference);
        });
    }

    //latitude, longitude clauses
    if (req.query.mapBounds)
    {
        var lMatches = req.query.mapBounds.match(/@\(\(([-.0-9]*),([-.0-9]*)\),\(([-.0-9]*),([-.0-9]*)\)\)/);
        if (lMatches.length === 5 )
        {
            lClauses.$and.push({latitude  : { $gt: lMatches[1], $lt: lMatches[3] }});
            lClauses.$and.push({longitude : { $gt: lMatches[2], $lt: lMatches[4] }});
        }

        //return value in callback
        callback(lClauses,null);
    }else if (req.query.slugName)
    {
        City.findOneBySlugName(req.query.slugName, function(err, city) {
            //if (err) {
            //    err;
                //@Todo Something to do here
                //return res.status(400).send({
                //    message: errorHandler.getErrorMessage(err)
                //});
            //} else {

                var ldLat = 0.1;
                var ldLng = ldLat * 7;

                lClauses.$and.push({latitude  : { $gt: city.latitude - ldLat/2 , $lt: city.latitude + ldLat/2}});
                lClauses.$and.push({longitude : { $gt: city.longitude - ldLng/2 , $lt: city.longitude + ldLng/2}});

                //return value in callback
                callback(lClauses,city);
            //}
        });
    }
};
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// SELECT CLASSIFIED
/**
 * Classified middleware
 *
 * @Todo By reference
 */
exports.classifiedByID = function(req, res, next, id) {
	Classified
        .findById(id)
        .populate('user', 'displayName')
        .exec(function(err, classified) {
            if (err) return next(err);
            if (!classified) return next(new Error('Failed to load classified ' + id));
            req.classified = classified;
            next();
        });
};

exports.classifiedByReference = function(req, res, next, reference) {
    Classified
        .findOneByReference(reference)
        .populate('user', 'displayName')
        .exec(function(err, classified) {
            if (err) return next(err);
            if (!classified) return next(new Error('Failed to load classified ' + reference));
            req.classified = classified;
            next();
        });
};

/**
 * Classified authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.classified.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};