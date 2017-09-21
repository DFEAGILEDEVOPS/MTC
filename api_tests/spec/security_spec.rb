describe 'Security API spec' do
  context 'GET request to admin home' do
    it 'should return response header' do
      request_helper = RequestHelper.new
      response = request_helper.admin_home
      expect(response.code).to eql 200
      expect(response.headers['x-dns-prefetch-control']).to eql 'off'
      expect(response.headers['x-frame-options']).to eql 'SAMEORIGIN'
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000"
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-xss-protection']).to eql "1; mode=block"
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; media-src 'none'; child-src 'none'"
      expect(response.headers['x-content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; media-src 'none'; child-src 'none'"
      expect(response.headers['x-webkit-csp']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; media-src 'none'; child-src 'none'"
    end
  end

  context 'GET request to SPA home' do
    it 'should return response header' do
      request_helper = RequestHelper.new
      response = request_helper.spa_home
      expect(response.code).to eql 200
      expect(response.headers['x-dns-prefetch-control']).to eql 'off'
      expect(response.headers['x-frame-options']).to eql 'SAMEORIGIN'
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000"
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-xss-protection']).to eql "1; mode=block"
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; media-src 'none'; child-src 'none'"
      expect(response.headers['x-content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; media-src 'none'; child-src 'none'"
      expect(response.headers['x-webkit-csp']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; media-src 'none'; child-src 'none'"
    end
  end

end