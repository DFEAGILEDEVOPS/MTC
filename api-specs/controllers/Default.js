'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.getQuestions = function getQuestions (req, res, next) {
  Default.getQuestions(req.swagger.params, res, next);
};
