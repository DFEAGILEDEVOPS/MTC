class RequestHelper
  include HTTParty

  def self.auth(school_pin, pupil_pin)
    HTTParty.post(ENV['PUPIL_API_BASE_URL']+"/auth", :body => {'schoolPin' => "#{school_pin}", 'pupilPin' => "#{pupil_pin}"}.to_json, headers: {'Content-Type' => 'application/json', 'Origin' => ENV['PUPIL_BASE_URL']})
  end

  def self.check_start_call(check_code, checkStartUrl, checkStartToken)
    ct = Time.now.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
    body_hash = {"version": "1", "checkCode": "#{check_code}", "clientCheckStartedAt": "#{ct}"}
    body_json = JSON.generate(body_hash)
    base64_encoded_body_josn = Base64.encode64(body_json)
    check_start_body_xml = get_message_api_xml(base64_encoded_body_josn)

    HTTParty.post("#{checkStartUrl}/messages?#{checkStartToken}", :body => check_start_body_xml, headers: {'Content-Type' => 'application/xml'})
  end

  def self.check_complete_call(pupil_auth_response)
    check_complete_body_xml = get_check_complete_json(pupil_auth_response)
    HTTParty.post("#{pupil_auth_response['tokens']['checkComplete']['url']}/messages?#{pupil_auth_response['tokens']['checkComplete']['token']}", :body => check_complete_body_xml, headers: {'Content-Type' => 'application/xml'})
  end

  def self.get_message_api_xml(message)
    builder = Nokogiri::XML::Builder.new(:encoding => 'UTF-8') do |xml|
      xml.QueueMessage {
        xml.MessageText "#{message}"
      }
    end
    builder.to_xml
  end

  def self.get_check_complete_json(parsed_response_pupil_auth)
    ct = Time.now.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
    body_hash = {
        "answers": [
            {
                "factor1": 2,
                "factor2": 5,
                "answer": "1",
                "sequenceNumber": 1,
                "question": "2x5",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 11,
                "factor2": 2,
                "answer": "",
                "sequenceNumber": 2,
                "question": "11x2",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 5,
                "factor2": 10,
                "answer": "",
                "sequenceNumber": 3,
                "question": "5x10",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 4,
                "factor2": 4,
                "answer": "",
                "sequenceNumber": 4,
                "question": "4x4",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 3,
                "factor2": 9,
                "answer": "8",
                "sequenceNumber": 5,
                "question": "3x9",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 2,
                "factor2": 4,
                "answer": "7",
                "sequenceNumber": 6,
                "question": "2x4",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 3,
                "factor2": 3,
                "answer": "8",
                "sequenceNumber": 7,
                "question": "3x3",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 4,
                "factor2": 9,
                "answer": "8",
                "sequenceNumber": 8,
                "question": "4x9",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 6,
                "factor2": 5,
                "answer": "8",
                "sequenceNumber": 9,
                "question": "6x5",
                "clientTimestamp": "#{ct}"
            },
            {
                "factor1": 12,
                "factor2": 12,
                "answer": "8",
                "sequenceNumber": 10,
                "question": "12x12",
                "clientTimestamp": "#{ct}"
            }
        ],
        "audit": [
            {
                "type": "WarmupStarted",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "WarmupIntroRendered",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 1,
                    "question": "1x7"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 1,
                    "question": "1x7"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "1x7"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "1x7"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 1,
                    "question": "1x7"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 2,
                    "question": "3x10"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 2,
                    "question": "3x10"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 2,
                    "question": "3x10"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 2,
                    "question": "3x10"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 2,
                    "question": "3x10"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 3,
                    "question": "2x6"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 3,
                    "question": "2x6"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 3,
                    "question": "2x6"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 3,
                    "question": "2x6"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "practiseSequenceNumber": 3,
                    "question": "2x6"
                }
            },
            {
                "type": "WarmupCompleteRendered",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "QuestionIntroRendered",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "CheckStarted",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "CheckStartedApiCalled",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "2x5"
                }
            },
            {
                "type": "CheckStartedAPICallSucceeded",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "2x5"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "2x5"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "2x5"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 1,
                    "question": "2x5"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 2,
                    "question": "11x2"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 2,
                    "question": "11x2"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 2,
                    "question": "11x2"
                }
            },
            {
                "type": "QuestionTimerEnded",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 2,
                    "question": "11x2"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 3,
                    "question": "5x10"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 3,
                    "question": "5x10"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 3,
                    "question": "5x10"
                }
            },
            {
                "type": "QuestionTimerEnded",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 3,
                    "question": "5x10"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 4,
                    "question": "4x4"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 4,
                    "question": "4x4"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 4,
                    "question": "4x4"
                }
            },
            {
                "type": "QuestionTimerEnded",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 4,
                    "question": "4x4"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 5,
                    "question": "3x9"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 5,
                    "question": "3x9"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 5,
                    "question": "3x9"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 5,
                    "question": "3x9"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 5,
                    "question": "3x9"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 6,
                    "question": "2x4"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 6,
                    "question": "2x4"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 6,
                    "question": "2x4"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 6,
                    "question": "2x4"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 6,
                    "question": "2x4"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 7,
                    "question": "3x3"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 7,
                    "question": "3x3"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 7,
                    "question": "3x3"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 7,
                    "question": "3x3"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 7,
                    "question": "3x3"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 8,
                    "question": "4x9"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 8,
                    "question": "4x9"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 8,
                    "question": "4x9"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 8,
                    "question": "4x9"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 8,
                    "question": "4x9"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 9,
                    "question": "6x5"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 9,
                    "question": "6x5"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 9,
                    "question": "6x5"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 9,
                    "question": "6x5"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 9,
                    "question": "6x5"
                }
            },
            {
                "type": "PauseRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 10,
                    "question": "12x12"
                }
            },
            {
                "type": "QuestionRendered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 10,
                    "question": "12x12"
                }
            },
            {
                "type": "QuestionTimerStarted",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 10,
                    "question": "12x12"
                }
            },
            {
                "type": "QuestionTimerCancelled",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 10,
                    "question": "12x12"
                }
            },
            {
                "type": "QuestionAnswered",
                "clientTimestamp": "#{ct}",
                "data": {
                    "sequenceNumber": 10,
                    "question": "12x12"
                }
            },
            {
                "type": "CheckSubmissionPending",
                "clientTimestamp": "#{ct}"
            },
            {
                "type": "CheckSubmissionApiCalled",
                "clientTimestamp": "#{ct}"
            }
        ],
        "config": {
            "questionTime": 6,
            "loadingTime": 3,
            "speechSynthesis": false,
            "audibleSounds": false,
            "numpadRemoval": false,
            "fontSize": false,
            "colourContrast": false
        },
        "device": {
            "battery": {
                "isCharging": false,
                "levelPercent": 39,
                "chargingTime": nil,
                "dischargingTime": 10500
            },
            "cpu": {
                "hardwareConcurrency": 4
            },
            "navigator": {
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
                "platform": "MacIntel",
                "language": "en-GB",
                "cookieEnabled": true,
                "doNotTrack": nil
            },
            "networkConnection": {
                "downlink": 8.1,
                "effectiveType": "4g",
                "rtt": 50
            },
            "screen": {
                "screenWidth": 1440,
                "screenHeight": 900,
                "outerWidth": 1372,
                "outerHeight": 682,
                "innerWidth": 1372,
                "innerHeight": 682,
                "colorDepth": 24,
                "orientation": "landscape-primary"
            }
        },
        "inputs": [
            {
                "input": "1",
                "eventType": "keydown",
                "clientTimestamp": "#{ct}",
                "question": "2x5",
                "sequenceNumber": 1
            },
            {
                "input": "Enter",
                "eventType": "keydown",
                "clientTimestamp": "#{ct}",
                "question": "2x5",
                "sequenceNumber": 1
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "3x9",
                "sequenceNumber": 5
            },
            {
                "input": "8",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "3x9",
                "sequenceNumber": 5
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "3x9",
                "sequenceNumber": 5
            },
            {
                "input": "Enter",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "3x9",
                "sequenceNumber": 5
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "2x4",
                "sequenceNumber": 6
            },
            {
                "input": "7",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "2x4",
                "sequenceNumber": 6
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "2x4",
                "sequenceNumber": 6
            },
            {
                "input": "Enter",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "2x4",
                "sequenceNumber": 6
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "3x3",
                "sequenceNumber": 7
            },
            {
                "input": "8",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "3x3",
                "sequenceNumber": 7
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "3x3",
                "sequenceNumber": 7
            },
            {
                "input": "Enter",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "3x3",
                "sequenceNumber": 7
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "4x9",
                "sequenceNumber": 8
            },
            {
                "input": "8",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "4x9",
                "sequenceNumber": 8
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "4x9",
                "sequenceNumber": 8
            },
            {
                "input": "Enter",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "4x9",
                "sequenceNumber": 8
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "6x5",
                "sequenceNumber": 9
            },
            {
                "input": "8",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "6x5",
                "sequenceNumber": 9
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "6x5",
                "sequenceNumber": 9
            },
            {
                "input": "Enter",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "6x5",
                "sequenceNumber": 9
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "12x12",
                "sequenceNumber": 10
            },
            {
                "input": "8",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "12x12",
                "sequenceNumber": 10
            },
            {
                "input": "left click",
                "eventType": "mousedown",
                "clientTimestamp": "#{ct}",
                "question": "12x12",
                "sequenceNumber": 10
            },
            {
                "input": "Enter",
                "eventType": "click",
                "clientTimestamp": "#{ct}",
                "question": "12x12",
                "sequenceNumber": 10
            }
        ],
        "pupil": {
            "checkCode": "#{parsed_response_pupil_auth['pupil']['checkCode']}"
        },
        "questions": parsed_response_pupil_auth['questions'],
        "school": parsed_response_pupil_auth['school'],
        "tokens": parsed_response_pupil_auth['tokens'],
        "checkCode": "#{parsed_response_pupil_auth['pupil']['checkCode']}",
        "version": "1"
    }
    body_json = JSON.generate(body_hash)
    base64_encoded_body_josn = Base64.encode64(body_json)
    check_start_body_xml = get_message_api_xml(base64_encoded_body_josn)
  end

end
