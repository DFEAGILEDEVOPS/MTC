'use strict';

exports.getQuestions = function(args, res, next) {
  /**
   * parameters expected in the args:
  * pupilDetails (PupilDetails)
  **/
    var examples = {};
  examples['application/json'] = {
  "school" : {
    "name" : "Hogwarts School of Witchcraft and Wizardry",
    "Id" : 123456
  },
  "questions" : [ {
    "factor2" : 2,
    "rank" : 1,
    "factor1" : 3
  } ],
  "pupil" : {
    "firstName" : "Morgan",
    "lastName" : "Freeman",
    "loadingTime" : 1.3579000000000001069366817318950779736042022705078125,
    "sessionId" : "aeiou",
    "questionTime" : 1.3579000000000001069366817318950779736042022705078125
  }
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

