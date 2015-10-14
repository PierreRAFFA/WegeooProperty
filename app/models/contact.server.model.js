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
    },
    website: {
        type: String
    }
});

ContactSchema.statics.getOrCreate = function(clauses, callback)
{
    var Self = this;
    this.findOne(clauses ,  function (err, contact) {

        if (err) {
            console.log('Error when trying to get contact');
        } else {
            if (!contact) {

                //Create a contact
                console.log('create a contact');
                var newContact = new Self(clauses);

                newContact.save(function (err) {
                    if (err) {
                        console.log('Error when trying to save the contact');
                    } else {
                        console.log('contact created');
                        return callback.call(null, newContact);
                    }
                });
            } else {
                console.log('contact found');
                return callback.call(null, contact);
            }
        }
    });
};

mongoose.model('Contact', ContactSchema , 'contacts');
