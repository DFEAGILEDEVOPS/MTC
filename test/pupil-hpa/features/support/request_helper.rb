class RequestHelper
  include HTTParty

  def self.auth(school_pin, pupil_pin, build_version = 1)
    body = { 'schoolPin' => school_pin, 'pupilPin' => pupil_pin }
    body['buildVersion'] = build_version unless build_version.nil?
    HTTParty.post(ENV['PUPIL_API_BASE_URL'] + "/auth", :body => body.to_json, headers: { 'Content-Type' => 'application/json', 'Origin' => ENV['PUPIL_BASE_URL'] })
  end

  def self.submit_check(jwt, payload)
    HTTParty.post(ENV['PUPIL_API_BASE_URL'] + "/submit", :body => payload.to_json, headers: { 'Content-Type' => 'application/json', 'Origin' => ENV['PUPIL_BASE_URL'], "Authorization" => "Bearer #{jwt}" })
  end

  def self.check_start_call(check_code, checkStartUrl, checkStartToken)
    ct = Time.now.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
    body_hash = { "version": "1", "checkCode": "#{check_code}", "clientCheckStartedAt": "#{ct}" }
    body_json = JSON.generate(body_hash)
    base64_encoded_body_josn = Base64.encode64(body_json)
    check_start_body_xml = get_message_api_xml(base64_encoded_body_josn)

    HTTParty.post("#{checkStartUrl}/messages?#{checkStartToken}", :body => check_start_body_xml, headers: { 'Content-Type' => 'application/xml' })
  end

  def self.check_complete_call(pupil_auth_response)
    check_complete_body_xml = get_check_complete_json(pupil_auth_response)
    HTTParty.post("#{pupil_auth_response['tokens']['checkComplete']['url']}/messages?#{pupil_auth_response['tokens']['checkComplete']['token']}", :body => check_complete_body_xml, headers: { 'Content-Type' => 'application/xml' })
  end

  def self.get_message_api_xml(message)
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.QueueMessage {
        xml.MessageText "#{message}"
      }
    end
    builder.to_xml
  end

  def self.build_payload_json(parsed_response_pupil_auth, input_type = 'mouse')
    seconds = 1
    {
      "answers": [
        {
          "factor1": 1,
          "factor2": 1,
          "answer": "2",
          "sequenceNumber": 1,
          "question": "1x1",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 2,
          "answer": "0",
          "sequenceNumber": 2,
          "question": "1x2",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 3,
          "answer": "0",
          "sequenceNumber": 3,
          "question": "1x3",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 4,
          "answer": "0",
          "sequenceNumber": 4,
          "question": "1x4",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 5,
          "answer": "0",
          "sequenceNumber": 5,
          "question": "1x5",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 6,
          "answer": "0",
          "sequenceNumber": 6,
          "question": "1x6",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 7,
          "answer": "0",
          "sequenceNumber": 7,
          "question": "1x7",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 8,
          "answer": "0",
          "sequenceNumber": 8,
          "question": "1x8",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 9,
          "answer": "0",
          "sequenceNumber": 9,
          "question": "1x9",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 10,
          "answer": "0",
          "sequenceNumber": 10,
          "question": "1x10",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 11,
          "answer": "",
          "sequenceNumber": 11,
          "question": "1x11",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 1,
          "factor2": 12,
          "answer": "0",
          "sequenceNumber": 12,
          "question": "1x12",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 1,
          "answer": "0",
          "sequenceNumber": 13,
          "question": "2x1",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 2,
          "answer": "0",
          "sequenceNumber": 14,
          "question": "2x2",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 3,
          "answer": "",
          "sequenceNumber": 15,
          "question": "2x3",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 4,
          "answer": "0",
          "sequenceNumber": 16,
          "question": "2x4",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "0",
          "sequenceNumber": 17,
          "question": "2x5",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 6,
          "answer": "0",
          "sequenceNumber": 18,
          "question": "2x6",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 7,
          "answer": "0",
          "sequenceNumber": 19,
          "question": "2x7",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 8,
          "answer": "0",
          "sequenceNumber": 20,
          "question": "2x8",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 9,
          "answer": "0",
          "sequenceNumber": 21,
          "question": "2x9",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 10,
          "answer": "0",
          "sequenceNumber": 22,
          "question": "2x10",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 11,
          "answer": "0",
          "sequenceNumber": 23,
          "question": "2x11",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 2,
          "factor2": 12,
          "answer": "0",
          "sequenceNumber": 24,
          "question": "2x12",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "factor1": 3,
          "factor2": 1,
          "answer": "0",
          "sequenceNumber": 25,
          "question": "3x1",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        }
      ],
      "audit": [
        {
          "type": "WarmupStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "WarmupIntroRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12",
            "isWarmup": true
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "2x2",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "2x2",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "2x2",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "2x2",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10",
            "isWarmup": true
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10",
            "isWarmup": true
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10",
            "isWarmup": true
          }
        },
        {
          "type": "WarmupCompleteRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "QuestionIntroRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "CheckStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "CheckStartedApiCalled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "CheckStartedAPICallSucceeded",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5",
            "isWarmup": false
          }
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5",
            "isWarmup": false
          }
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5",
            "isWarmup": false
          }
        },
        {
          "type": "CheckSubmissionPending",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        },
        {
          "type": "CheckSubmissionApiCalled",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}"
        }
      ],
      "device": {
        "battery": {
          "isCharging": true,
          "levelPercent": 100,
          "chargingTime": 0,
          "dischargingTime": nil
        },
        "cpu": {
          "hardwareConcurrency": 12
        },
        "navigator": {
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/86.0.4240.111 Safari/537.36",
          "platform": "MacIntel",
          "language": "en-US",
          "cookieEnabled": true,
          "doNotTrack": nil
        },
        "networkConnection": {
          "downlink": 9.2,
          "effectiveType": "4g",
          "rtt": 0
        },
        "screen": {
          "screenWidth": 2560,
          "screenHeight": 1440,
          "outerWidth": 1270,
          "outerHeight": 768,
          "innerWidth": 1270,
          "innerHeight": 768,
          "colorDepth": 24,
          "orientation": "landscape-primary"
        },
        "deviceId": "01e3d742-2b52-4772-901b-3b8d535375e8",
        "appUsageCounter": 1
      },
      "inputs": [
        {
          "input": "2",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x1",
          "sequenceNumber": 1
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x1",
          "sequenceNumber": 1
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x1",
          "sequenceNumber": 1
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x2",
          "sequenceNumber": 2
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x2",
          "sequenceNumber": 2
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x3",
          "sequenceNumber": 3
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x3",
          "sequenceNumber": 3
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x4",
          "sequenceNumber": 4
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x4",
          "sequenceNumber": 4
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x5",
          "sequenceNumber": 5
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x5",
          "sequenceNumber": 5
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x6",
          "sequenceNumber": 6
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x6",
          "sequenceNumber": 6
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x7",
          "sequenceNumber": 7
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x7",
          "sequenceNumber": 7
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x8",
          "sequenceNumber": 8
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x8",
          "sequenceNumber": 8
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x9",
          "sequenceNumber": 9
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x9",
          "sequenceNumber": 9
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x10",
          "sequenceNumber": 10
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x10",
          "sequenceNumber": 10
        },
        {
          "input": "7",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x11",
          "sequenceNumber": 11
        },
        {
          "input": "Backspace",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x11",
          "sequenceNumber": 11
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x11",
          "sequenceNumber": 11
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x12",
          "sequenceNumber": 12
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x12",
          "sequenceNumber": 12
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "1x12",
          "sequenceNumber": 12
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x1",
          "sequenceNumber": 13
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x1",
          "sequenceNumber": 13
        },
        {
          "input": "3",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x2",
          "sequenceNumber": 14
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x2",
          "sequenceNumber": 14
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x3",
          "sequenceNumber": 15
        },
        {
          "input": "Backspace",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x3",
          "sequenceNumber": 15
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x3",
          "sequenceNumber": 15
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x4",
          "sequenceNumber": 16
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x4",
          "sequenceNumber": 16
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x5",
          "sequenceNumber": 17
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x5",
          "sequenceNumber": 17
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x6",
          "sequenceNumber": 18
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x6",
          "sequenceNumber": 18
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x7",
          "sequenceNumber": 19
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x7",
          "sequenceNumber": 19
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x8",
          "sequenceNumber": 20
        },
        {
          "input": "9",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x8",
          "sequenceNumber": 20
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x8",
          "sequenceNumber": 20
        },
        {
          "input": "5",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x9",
          "sequenceNumber": 21
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x9",
          "sequenceNumber": 21
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x10",
          "sequenceNumber": 22
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x10",
          "sequenceNumber": 22
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x11",
          "sequenceNumber": 23
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x11",
          "sequenceNumber": 23
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x12",
          "sequenceNumber": 24
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "2x12",
          "sequenceNumber": 24
        },
        {
          "input": "8",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "3x1",
          "sequenceNumber": 25
        },
        {
          "input": "Enter",
          "eventType": "#{input_type}",
          "clientTimestamp": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
          "question": "3x1",
          "sequenceNumber": 25
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
      "createdAt": "#{(Time.now + seconds += 1).strftime("%Y-%m-%dT%H:%M:%S.%LZ")}",
      "pinExpiresAt": "2022-01-10T23:59:59.999Z",
      "pupil": {
        "checkCode": parsed_response_pupil_auth['checkCode']
      },
      "questions": parsed_response_pupil_auth['questions'],
      "school": parsed_response_pupil_auth['school'],
      "tokens": parsed_response_pupil_auth['tokens'],
      "updatedAt": "2021-01-10T10:27:49.196Z",
      "checkCode": parsed_response_pupil_auth['checkCode'],
      "schoolUUID": parsed_response_pupil_auth['school']['uuid']
    }
  end

  def self.build_check_submission_message(parsed_response_pupil_auth, correct_answers = nil,remove_device = nil, remove_answers = nil, input_type = 'mouse', validator_opts = {})
    correct_answers = nil if correct_answers == '0'
    correct_answers = (correct_answers.to_i) - 1 unless correct_answers.nil?
    @payload = build_payload_json(parsed_response_pupil_auth, input_type)
    @payload[:answers] << { :factor1 => 3, :factor2 => 7, :answer => 0, :sequenceNumber => 26, :question => "3x7", :clientTimestamp => "2021-10-04T11:22:45.015Z" } if validator_opts[:answer_not_a_string]
    @payload[:answers].pop if validator_opts[:decreased_answers_set]
    @payload[:answers][0..correct_answers].each { |q| q[:answer] = (q[:factor1] * q[:factor2]).to_s } unless correct_answers.nil?
    @payload[:answers] = Hash[@payload[:answers].map { |key, value| [key, value] }] if validator_opts[:answers_not_array]
    @payload[:audit] = Hash[@payload[:audit].map { |key, value| [key, value] }] if validator_opts[:audit_not_array]
    @payload.delete(:answers) unless remove_answers.nil?
    @payload.delete(:audit) if validator_opts[:remove_audit]
    @payload[:device] =  {"appUsageCounter": 1} unless remove_device.nil?
    @payload[:config] = [@payload[:config].to_s] if validator_opts[:config_not_object]
    @payload[:school] = @payload[:school].to_s if validator_opts[:school_not_object]
    @payload[:tokens] = @payload[:tokens].to_s if validator_opts[:tokens_not_object]
    @payload[:inputs] = @payload[:inputs].to_s if validator_opts[:inputs_not_array]
    @payload[:questions] = "" if validator_opts[:questions_not_array]
    @payload[:pupil] = @payload[:pupil].to_s if validator_opts[:pupil_not_object]
    @payload[:config] = [@payload[:config].to_s] if validator_opts[:config_not_object]
    @payload[:config] = @payload[:config].each { |k, v| @payload[:config][:practice] = true } if validator_opts[:practice]

    check_code = validator_opts[:check_code_not_uuid] ? parsed_response_pupil_auth['checkCode'].gsub('-', '') : parsed_response_pupil_auth['checkCode']
    { payload: @payload, submission_message: { "version": 3, "checkCode": check_code,
                                               "schoolUUID": parsed_response_pupil_auth['school']['uuid'],
                                               "archive": LZString::Base64.compress(@payload.to_json) } }
  end
end

