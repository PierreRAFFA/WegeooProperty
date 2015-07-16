'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ClassifiedSchema = new Schema({
    reference: {
        type: String,
        required: 'reference cannot be blank'
    },
    category: {
        type: Number,
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
		default: ''
	},
    description: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    optionss: {
        type: String,
        default: ''
    },
    city: {
        type: Schema.ObjectId,
        ref: 'City'
    },
    countryCode: {
        type: String,
        default: ''
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
});

mongoose.model('Classified', ClassifiedSchema);
