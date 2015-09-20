'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var i18n = require('i18n');
var config = require('../../config/config');
var _ = require('lodash');

/**
 * Classified Schema
 */
var ClassifiedSchema = new Schema({
    reference: {
        type: String,
        required: 'reference cannot be blank',
        unique:true
    },
    category: {
        type: String,
        required: 'category cannot be blank'
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
	modificationDate: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
        trim: true
	},
    description: {
        type: String,
        default: ''
    },
    details: config.classifiedDetails,
    optionss: {
        type: String,
        default: null
    },
    city: {
        type: Schema.ObjectId,
        ref: 'City'
    },
    availability:{
        type: Date,
        default: Date.now
    },
    /**
     * Nested informations to make the 'select' query easier
     */
    nCity:{
        slugName: {
            type: String,
        },
        parentCode: {
            type: String
        }
    },
    contact: {
        type: Schema.ObjectId,
        ref: 'Contact'
    },
    /**
     * Nested informations to make the 'select' query easier
     */
    nContact:{
        name: {
            type: String,
            required: 'nContact.name cannot be blank'
        },
        address: {
            type: String
        }
    },
    countryCode: {
        type: String,
        required: 'countryCode cannot be blank'
    },
    geolocalized: {
        type: Boolean,
        default: false
    },
    longitude: {
        type: Number,
        required: 'longitude cannot be blank'
    },
    latitude: {
        type: Number,
        required: 'latitude cannot be blank'
    },
    numSeen: {
        type: Number,
        default: 0
    },
    numWarnings: {
        type: Number,
        default: 0
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    activationCode: {
        type: String,
        default: ''
    },
    lostPasswordCode: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: false
    },
    external: {
        type: Boolean,
        default: false
    },
    numMailsReceived: {
        type: Number,
        default: 0
    },
    clientIp: {
        type: String,
        default: ''
    },
    medias: {
        type: Array,
        default: []
    }
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

ClassifiedSchema.statics.findOneByReference = function(reference,callback)
{
    this.findOne({reference:reference}, callback);
};
ClassifiedSchema.statics.findByReferenceLightResult = function(references,callback)
{
    var clauses = { $or:[] };
    _.forIn(references , function(reference)
    {
        clauses.$or.push({reference:reference});
    });

    console.dir(clauses);

    return this
        .find( clauses )
        .select('-_id medias reference title price description')
        .sort('-modificationDate')
        .exec(callback);
};
ClassifiedSchema.statics.findMostRecent = function(slugName,callback)
{
    var lCityName = slugName.substring(slugName.indexOf('-') + 1);
    return this
        .find( { $or: [ {'nCity.slugName' : slugName} , {'nCity.parentCode' : lCityName}] })
        .select('-_id medias reference title price category nCity.slugName countryLocale')
        .sort('-modificationDate')
        .limit(15)
        .exec(callback);
};

ClassifiedSchema.virtual('url').get(function()
{
    var lTheme      = i18n.__({phrase: 'wegeoo.' + config.theme , locale: this.countryLocale} );
    var lCategory   = i18n.__({phrase: 'classified.category' + this.category, locale: this.countryLocale} );

    return '/' + lTheme + '/' + lCategory + '/' + this.reference;
});

ClassifiedSchema.pre('save', function preSave(next){
    var now = new Date();
    this.modificationDate = now;
    // if ( !this.created_at ) {
    //    this.created_at = now;
    // }
    next();
});

mongoose.model('Classified', ClassifiedSchema);