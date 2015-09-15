'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ContactSchema = new Schema({
    name: {
        type: String,
        required: 'name cannot be blank'
    },
    address: {
        type: String
    },
    postcode: {
        type: String
    },
    city: {
        type: String
    },
    phone: {
        type: String
    },
    logo: {
        type: String
    },
    password: {
        type: String
    }
});

mongoose.model('Contact', ContactSchema , 'contacts');
