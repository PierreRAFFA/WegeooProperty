'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var CitySchema = new Schema({
    id: {
        type: String,
        required: 'id cannot be blank'
    },
    code: {
        type: String,
        required: 'code cannot be blank'
    },
    name: {
        type: String,
        required: 'name cannot be blank'
    },
    uppercaseName: {
        type: String,
        required: 'uppercaseName cannot be blank'
    },
    parentCode: {
        type: String
    },
    division: {
        type: String,
        required: 'division cannot be blank'
    },
    division2: {
        type: String,
        required: 'division2 cannot be blank'
    },
    pop: {
        type: Number,
        default: 0
    },
    postcode: {
        type: String,
        required: 'postcode cannot be blank'
    },
    longitude: {
        type: Number,
        required: 'longitude cannot be blank'
    },
    latitude: {
        type: Number,
        required: 'latitude cannot be blank'
    },
    googleLocalized: {
        type: Boolean,
        default: false
    },
    slugName: {
        type: String,
        required: 'slugName cannot be blank'
    }
});

mongoose.model('City', CitySchema , 'cities');
