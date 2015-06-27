'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('city', {
		user: req.user || null,
		request: req
	});
};