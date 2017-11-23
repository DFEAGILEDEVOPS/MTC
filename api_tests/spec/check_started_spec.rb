describe 'Security API spec' do
  context 'POST request to /api/check-started' do
    it 'should return 201 when credentials are valid' do
      request_helper = RequestHelper.new
      questions_response = request_helper.questions('abc12345', '9999a')
      response = request_helper.check_started(questions_response['pupil']['checkCode'],questions_response['access_token'])
      expect(response.code).to eql 201
    end

    it 'should return 401 when credentials are incorrect' do
      request_helper = RequestHelper.new
      questions_response = request_helper.questions('abc12345', '9999a')
      response = request_helper.check_started(questions_response['pupil']['checkCode'],questions_response['access_token']+'2')
      expect(response.code).to eql 401
    end

    it 'should return 400 when check code is empty' do
      request_helper = RequestHelper.new
      questions_response = request_helper.questions('abc12345', '9999a')
      response = request_helper.check_started('',questions_response['access_token'])
      expect(response.code).to eql 400
    end

    it 'should return 400 when access token is empty' do
      request_helper = RequestHelper.new
      questions_response = request_helper.questions('abc12345', '9999a')
      response = request_helper.check_started(questions_response['pupil']['checkCode'],'')
      expect(response.code).to eql 401
    end

  end

end