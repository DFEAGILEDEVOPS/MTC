describe 'Security API spec' do
  context 'GET request to admin home', :azure_admin do
    it 'should return correct response headers' do
      request_helper = RequestHelper.new
      response = request_helper.admin_home
      expect(response.code).to eql 200
      expect(response.headers['content-type']).to eql "text/html; charset=utf-8"
      expect(response.headers['expires']).to eql "0"
      expect(response.headers['pragma']).to eql "no-cache"
      expect(response.headers['surrogate-control']).to eql "no-store"
      expect(response.headers['x-dns-prefetch-control']).to eql 'off'
      expect(response.headers['x-frame-options']).to eql 'SAMEORIGIN'
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000"
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-xss-protection']).to eql "1; mode=block"
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://az416426.vo.msecnd.net https://devassets-as-mtc.azurewebsites.net/; font-src 'self' data:; style-src 'self' 'unsafe-inline' https://devassets-as-mtc.azurewebsites.net/; img-src 'self' https://www.google-analytics.com https://www.googletagmanager.com data: https://devassets-as-mtc.azurewebsites.net/; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://dc.services.visualstudio.com/v2/track; object-src 'self' https://devassets-as-mtc.azurewebsites.net/; media-src 'none'; child-src 'none'"

    end
  end

  context 'GET request to SPA home', :azure_spa do
    it 'should return correct response headers' do
      request_helper = RequestHelper.new
      response = request_helper.spa_home
      expect(response.code).to eql 200
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'none'; object-src 'none'; connect-src *; media-src data:"
      expect(response.headers['content-type']).to eql "text/html"
      expect(response.headers['server']).to eql 'nginx'
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000;"
      expect(response.headers['vary']).to eql "Accept-Encoding"
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-dns-prefetch-control']).to eql 'off'
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['x-frame-options']).to eql 'SAMEORIGIN'
      expect(response.headers['x-xss-protection']).to eql "1; mode=block"

    end
  end

end