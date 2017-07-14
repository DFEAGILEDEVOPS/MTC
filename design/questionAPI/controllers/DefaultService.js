'use strict';

exports.getQuestions = function(args, res, next) {
  /**
   * parameters expected in the args:
  * pupilDetails (PupilDetails)
  **/
    var examples = {};
  examples['application/json'] = {
  "factor2" : 5.0,
  "factor1" : 3.0
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

