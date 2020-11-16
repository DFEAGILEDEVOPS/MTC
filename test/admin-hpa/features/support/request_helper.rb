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

  def self.build_payload_json(parsed_response_pupil_auth, correct_answers = nil)
    ct = Time.now.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
    {
      "answers": [
        {
          "factor1": 1,
          "factor2": 1,
          "answer": "2",
          "sequenceNumber": 1,
          "question": "1x1",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 2,
          "answer": "0",
          "sequenceNumber": 2,
          "question": "1x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 3,
          "answer": "0",
          "sequenceNumber": 3,
          "question": "1x3",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 4,
          "answer": "0",
          "sequenceNumber": 4,
          "question": "1x4",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 5,
          "answer": "0",
          "sequenceNumber": 5,
          "question": "1x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 6,
          "answer": "0",
          "sequenceNumber": 6,
          "question": "1x6",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 7,
          "answer": "0",
          "sequenceNumber": 7,
          "question": "1x7",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 8,
          "answer": "0",
          "sequenceNumber": 8,
          "question": "1x8",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 9,
          "answer": "0",
          "sequenceNumber": 9,
          "question": "1x9",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 12,
          "factor2": 12,
          "answer": "0",
          "sequenceNumber": 10,
          "question": "12x12",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 1,
          "answer": "",
          "sequenceNumber": 11,
          "question": "1x1",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 2,
          "answer": "0",
          "sequenceNumber": 12,
          "question": "1x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 3,
          "answer": "0",
          "sequenceNumber": 13,
          "question": "1x3",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 4,
          "answer": "0",
          "sequenceNumber": 14,
          "question": "1x4",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 5,
          "answer": "",
          "sequenceNumber": 15,
          "question": "1x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 6,
          "answer": "0",
          "sequenceNumber": 16,
          "question": "1x6",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 7,
          "answer": "0",
          "sequenceNumber": 17,
          "question": "1x7",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 8,
          "answer": "0",
          "sequenceNumber": 18,
          "question": "1x8",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 9,
          "answer": "0",
          "sequenceNumber": 19,
          "question": "1x9",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 12,
          "factor2": 12,
          "answer": "0",
          "sequenceNumber": 20,
          "question": "12x12",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 2,
          "answer": "0",
          "sequenceNumber": 21,
          "question": "1x2",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 3,
          "answer": "0",
          "sequenceNumber": 22,
          "question": "1x3",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 4,
          "answer": "0",
          "sequenceNumber": 23,
          "question": "1x4",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 1,
          "factor2": 5,
          "answer": "0",
          "sequenceNumber": 24,
          "question": "1x5",
          "clientTimestamp": "#{ct}"
        },
        {
          "factor1": 2,
          "factor2": 5,
          "answer": "0",
          "sequenceNumber": 25,
          "question": "2x5",
          "clientTimestamp": "#{ct}"
        }
      ],
      "audit": [
        {
          "type": "WarmupStarted",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.00"
        },
        {
          "type": "WarmupIntroRendered",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.006"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 1,
            "question": "1x12"
          },
          "relativeTiming": "+0.028"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 1,
            "question": "1x12"
          },
          "relativeTiming": "+3.003"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x12"
          },
          "relativeTiming": "+0.152"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 1,
            "question": "1x12"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 2,
            "question": "2x2"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 2,
            "question": "2x2"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "2x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 2,
            "question": "2x2"
          },
          "relativeTiming": "+0.075"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "2x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 3,
            "question": "10x10"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 3,
            "question": "10x10"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "practiseSequenceNumber": 3,
            "question": "10x10"
          },
          "relativeTiming": "+0.134"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "10x10"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "WarmupCompleteRendered",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.002"
        },
        {
          "type": "QuestionIntroRendered",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.022"
        },
        {
          "type": "CheckStarted",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.022"
        },
        {
          "type": "CheckStartedApiCalled",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1"
          },
          "relativeTiming": "+0.009"
        },
        {
          "type": "CheckStartedAPICallSucceeded",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.357"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1"
          },
          "relativeTiming": "+2.647"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1"
          },
          "relativeTiming": "+0.071"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 1,
            "question": "1x1"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2"
          },
          "relativeTiming": "+3.003"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2"
          },
          "relativeTiming": "+0.073"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 2,
            "question": "1x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3"
          },
          "relativeTiming": "+0.074"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 3,
            "question": "1x3"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4"
          },
          "relativeTiming": "+0.069"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 4,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5"
          },
          "relativeTiming": "+0.095"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 5,
            "question": "1x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6"
          },
          "relativeTiming": "+0.088"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 6,
            "question": "1x6"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7"
          },
          "relativeTiming": "+0.103"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 7,
            "question": "1x7"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8"
          },
          "relativeTiming": "+0.087"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 8,
            "question": "1x8"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9"
          },
          "relativeTiming": "+3.003"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9"
          },
          "relativeTiming": "+0.093"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 9,
            "question": "1x9"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12"
          },
          "relativeTiming": "+0.124"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 10,
            "question": "12x12"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1"
          },
          "relativeTiming": "+0.072"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 11,
            "question": "1x1"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2"
          },
          "relativeTiming": "+0.086"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 12,
            "question": "1x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3"
          },
          "relativeTiming": "+3.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3"
          },
          "relativeTiming": "+0.08"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 13,
            "question": "1x3"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4"
          },
          "relativeTiming": "+0.084"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 14,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5"
          },
          "relativeTiming": "+0.099"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 15,
            "question": "1x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6"
          },
          "relativeTiming": "+0.091"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 16,
            "question": "1x6"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7"
          },
          "relativeTiming": "+3.003"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7"
          },
          "relativeTiming": "+0.091"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 17,
            "question": "1x7"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8"
          },
          "relativeTiming": "+3.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8"
          },
          "relativeTiming": "+0.099"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 18,
            "question": "1x8"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9"
          },
          "relativeTiming": "+3.002"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9"
          },
          "relativeTiming": "+0.09"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 19,
            "question": "1x9"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12"
          },
          "relativeTiming": "+0.109"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 20,
            "question": "12x12"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2"
          },
          "relativeTiming": "+0.072"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 21,
            "question": "1x2"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3"
          },
          "relativeTiming": "+3.003"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3"
          },
          "relativeTiming": "+0.081"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 22,
            "question": "1x3"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4"
          },
          "relativeTiming": "+3.004"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4"
          },
          "relativeTiming": "+0.07"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 23,
            "question": "1x4"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5"
          },
          "relativeTiming": "+3.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5"
          },
          "relativeTiming": "+0.098"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 24,
            "question": "1x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "PauseRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5"
          },
          "relativeTiming": "+0.001"
        },
        {
          "type": "QuestionTimerStarted",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5"
          },
          "relativeTiming": "+3.003"
        },
        {
          "type": "QuestionRendered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "QuestionTimerCancelled",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5"
          },
          "relativeTiming": "+0.088"
        },
        {
          "type": "QuestionAnswered",
          "clientTimestamp": "#{ct}",
          "data": {
            "sequenceNumber": 25,
            "question": "2x5"
          },
          "relativeTiming": "+0"
        },
        {
          "type": "CheckSubmissionPending",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0"
        },
        {
          "type": "CheckSubmissionApiCalled",
          "clientTimestamp": "#{ct}",
          "relativeTiming": "+0.004"
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
      "updatedAt": "2021-01-10T10:27:49.196Z",
      "checkCode": parsed_response_pupil_auth['checkCode']
    }
  end

  def self.build_check_submission_message(parsed_response_pupil_auth, correct_answers = nil, remove_answers = nil)
    correct_answers = nil if correct_answers == '0'
    correct_answers = (correct_answers.to_i) - 1 unless correct_answers.nil?
    @payload = build_payload_json(parsed_response_pupil_auth)
    @payload[:answers][0..correct_answers].each {|q| q[:answer] = q[:factor1] * q[:factor2]} unless correct_answers.nil?
    @payload.delete(:answers) unless remove_answers.nil?
    {"version": 2, "checkCode": parsed_response_pupil_auth['checkCode'],
     "schoolUUID": parsed_response_pupil_auth['school']['uuid'],
     "archive": LZString::UTF16.compress(@payload.to_json)
    }
    {payload: @payload, submission_message: {"version": 2, "checkCode": parsed_response_pupil_auth['checkCode'],
                                             "schoolUUID": parsed_response_pupil_auth['school']['uuid'],
                                             "archive": LZString::UTF16.compress(@payload.to_json)}}
  end

end
