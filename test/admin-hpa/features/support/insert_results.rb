class ResultsCreation

  def self.details(id)
    {"updatedAt": DateTime.now,
     "createdAt": DateTime.now,
     "pupil": BSON::ObjectId(id),
     "school": 9991002,
     "isElectron": false,
     "logonEvent": BSON::ObjectId(id),
     "testId": "6c004fac-99e4-4036-8159-66c176ee4c5c",
     "sessionId": "cLX-eONq1_K4UObWomH0qlC1gsVDX778",
     "result": {"correct": 28, "isPass": true},
     "answers": [{"isCorrect": true, "answerDate": DateTime.now, "factor1": 7, "factor2": 1, "input": "7", "registeredInputs": [{"input": "leftclick", "eventType": "mousedown", "clientTimestamp": DateTime.now}, {"input": "7", "eventType": "click", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 2, "factor2": 2, "input": "4", "registeredInputs": [{"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 4, "factor2": 10, "input": "40", "registeredInputs": [{"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "0", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 4, "factor2": 3, "input": "12", "registeredInputs": [{"input": "1", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 8, "factor2": 2, "input": "16", "registeredInputs": [{"input": "1", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "6", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 3, "factor2": 10, "input": "30", "registeredInputs": [{"input": "3", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "0", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": false, "answerDate": DateTime.now, "factor1": 7, "factor2": 5, "input": "3", "registeredInputs": [{"input": "3", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 6, "factor2": 6, "input": "36", "registeredInputs": [{"input": "3", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "6", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 10, "factor2": 2, "input": "20", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "0", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 9, "factor2": 8, "input": "72", "registeredInputs": [{"input": "7", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 12, "factor2": 12, "input": "144", "registeredInputs": [{"input": "1", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 5, "factor2": 11, "input": "55", "registeredInputs": [{"input": "5", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "5", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 4, "factor2": 9, "input": "36", "registeredInputs": [{"input": "3", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "6", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 8, "factor2": 12, "input": "96", "registeredInputs": [{"input": "9", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "6", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 4, "factor2": 7, "input": "28", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "8", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 10, "factor2": 11, "input": "110", "registeredInputs": [{"input": "1", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "1", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "0", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 5, "factor2": 4, "input": "20", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "0", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 12, "factor2": 6, "input": "72", "registeredInputs": [{"input": "7", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 7, "factor2": 9, "input": "63", "registeredInputs": [{"input": "6", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "3", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 9, "factor2": 1, "input": "9", "registeredInputs": [{"input": "9", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 6, "factor2": 8, "input": "48", "registeredInputs": [{"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "8", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 2, "factor2": 12, "input": "24", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 3, "factor2": 3, "input": "9", "registeredInputs": [{"input": "9", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 11, "factor2": 8, "input": "88", "registeredInputs": [{"input": "8", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "8", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": false, "answerDate": DateTime.now, "factor1": 12, "factor2": 4, "input": "24", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 3, "factor2": 9, "input": "27", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "7", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 5, "factor2": 1, "input": "5", "registeredInputs": [{"input": "5", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 4, "factor2": 11, "input": "44", "registeredInputs": [{"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 7, "factor2": 6, "input": "42", "registeredInputs": [{"input": "4", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]},
                 {"isCorrect": true, "answerDate": DateTime.now, "factor1": 1, "factor2": 2, "input": "2", "registeredInputs": [{"input": "2", "eventType": "keydown", "clientTimestamp": DateTime.now}, {"input": "enter", "eventType": "keydown", "clientTimestamp": DateTime.now}]}], "creationDate": DateTime.now, "__v": 0}
  end
end

