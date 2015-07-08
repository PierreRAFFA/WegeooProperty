'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	classifieds = require('../../app/controllers/classifieds.server.controller');

module.exports = function(app) {
	// Classified Routes
	app.route('/classifieds')
		.get(classifieds.list)
		//.post(users.requiresLogin, classifieds.create);
		.post(classifieds.create);//no need to be registered to post a classified

	app.route('/classifieds/:classifiedId')
		.get(classifieds.read)
		.put(users.requiresLogin, classifieds.hasAuthorization, classifieds.update)
		.delete(users.requiresLogin, classifieds.hasAuthorization, classifieds.delete);

	// Finish by binding the classified middleware
	app.param('classifiedId', classifieds.classifiedByID);
};