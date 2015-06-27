'use strict';

module.exports = function(app) {

    var core = require('../../app/controllers/city.server.controller');
    app.route('/:theme/:category/:cityPostCode-:cityName').get(core.index);
};