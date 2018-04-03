describe 'Security API spec' do
  context 'GET request to admin home', :azure_admin do
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
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; font-src 'self' data:; style-src 'self' 'unsafe-inline'; img-src 'self' https://www.google-analytics.com data:; connect-src 'self' https://www.google-analytics.com; object-src 'self'; media-src 'none'; child-src 'none'"
    end
  end

  context 'GET request to SPA home', :azure_spa do
    it 'should return response header' do
      request_helper = RequestHelper.new
      response = request_helper.spa_home
      expect(response.code).to eql 200
      expect(response.headers['x-dns-prefetch-control']).to eql 'off'
      expect(response.headers['x-frame-options']).to eql 'SAMEORIGIN'
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000;"
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['server']).to eql 'nginx'
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-xss-protection']).to eql "1; mode=block"
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'none'; object-src 'none'; connect-src *"
    end
  end

end