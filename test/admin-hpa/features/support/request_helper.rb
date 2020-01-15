class RequestHelper
  include HTTParty

  def self.auth(school_pin, pupil_pin)
    HTTParty.post(ENV['PUPIL_API_BASE_URL'] + "/auth", :body => {'schoolPin' => "#{school_pin}", 'pupilPin' => "#{pupil_pin}"}.to_json, headers: {'Content-Type' => 'application/json', 'Origin' => ENV['PUPIL_BASE_URL']})
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
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.QueueMessage {
        xml.MessageText "#{message}"
      }
    end
    builder.to_xml
  end

  def self.build_payload_json(parsed_response_pupil_auth)
    ct = Time.now.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
    {
      "answers": [
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "5",
          "sequenceNumber": 1,
          "question": "2x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 11,
          "factor2": 2,
          "answer": "5",
          "sequenceNumber": 2,
          "question": "11x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "5",
          "sequenceNumber": 1,
          "question": "2x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 11,
          "factor2": 2,
          "answer": "5",
          "sequenceNumber": 2,
          "question": "11x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "5",
          "sequenceNumber": 1,
          "question": "2x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 11,
          "factor2": 2,
          "answer": "5",
          "sequenceNumber": 2,
          "question": "11x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "5",
          "sequenceNumber": 1,
          "question": "2x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 11,
          "factor2": 2,
          "answer": "5",
          "sequenceNumber": 2,
          "question": "11x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "5",
          "sequenceNumber": 1,
          "question": "2x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 11,
          "factor2": 2,
          "answer": "5",
          "sequenceNumber": 2,
          "question": "11x2",
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
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 8,
            "question": "4x9"
          }
        }
      ],
      "device": {
        "battery": {
          "isCharging": true,
          "levelPercent": 100,
          "chargingTime": 0,
          "dischargingTime": 'null'
        },
        "cpu": {
          "hardwareConcurrency": 8
        },
        "navigator": {
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
          "platform": "MacIntel",
          "language": "en-US",
          "cookieEnabled": true,
          "doNotTrack": 'null'
        },
        "networkConnection": {
          "downlink": 10,
          "effectiveType": "4g",
          "rtt": 50
        },
        "screen": {
          "screenWidth": 1680,
          "screenHeight": 1050,
          "outerWidth": 1680,
          "outerHeight": 949,
          "innerWidth": 760,
          "innerHeight": 949,
          "colorDepth": 24,
          "orientation": "landscape-primary"
        }
      },
      "inputs": [
        {
          "input": "5",
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
          "input": "Enter",
          "eventType": "keydown",
          "clientTimestamp": "#{ct}",
          "question": "11x2",
          "sequenceNumber": 2
        }
      ],
      "config": {
        "audibleSounds": false,
        "checkTime": 30,
        "colourContrast": false,
        "fontSize": false,
        "inputAssistance": false,
        "loadingTime": 3,
        "nextBetweenQuestions": false,
        "numpadRemoval": false,
        "practice": false,
        "questionReader": false,
        "questionTime": 6,
        "compressCompletedCheck": true
      },
      "createdAt": "#{ct}",
      "pinExpiresAt": "2022-01-10T23:59:59.999Z",
      "pupil": {
        "checkCode": parsed_response_pupil_auth['checkCode']
      },
      "questions": parsed_response_pupil_auth['questions'],
      "school": parsed_response_pupil_auth['school'],
      "tokens": parsed_response_pupil_auth['tokens'],
      "updatedAt": "2020-01-10T10:27:49.196Z",
      "checkCode": parsed_response_pupil_auth['checkCode']
    }
  end

  def self.build_check_submission_message(parsed_response_pupil_auth)
    payload = build_payload_json(parsed_response_pupil_auth)
    {"version": 2, "checkCode": parsed_response_pupil_auth['checkCode'],
     "schoolUUID": parsed_response_pupil_auth['school']['uuid'],
     "archive": LZString::UTF16.compress(payload.to_json)
    }
  end

end
