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
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000; includeSubDomains; preload"
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-xss-protection']).to eql "0"
      expect(response.headers['permissions-policy']).to eql "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()"
      expect(response.headers['x-permitted-cross-domain-policies']).to eql "none"
      csp_array = ["default-src", "'self';", "script-src", "'self'", "'unsafe-inline'", "https://www.google-analytics.com",
                   "https://www.googletagmanager.com", "https://az416426.vo.msecnd.net", "font-src", "'self'",
                   "style-src", "'self'", "'unsafe-inline'",
                   "img-src", "'self'", "https://www.google-analytics.com", "https://www.googletagmanager.com", "data:",
                   "connect-src", "'self'", "https://www.google-analytics.com", "https://www.googletagmanager.com",
                   "https://dc.services.visualstudio.com/v2/track;", "object-src", "'self'", "media-src", "'none';",
                   "child-src", "'none'"]
      csp_array.each {|csp_value| expect(response.headers['content-security-policy']).to include csp_value}
    end
  end

  context 'GET request to SPA home', :azure_spa do
    it 'should return correct response headers' do
      request_helper = RequestHelper.new
      response = request_helper.spa_home
      expect(response.code).to eql 200
      expect(response.headers['content-security-policy']).to eql "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com "\
                                                                          "https://js.monitor.azure.com/scripts/b/ai.2.min.js https://*.msecnd.net:*; img-src 'self' "\
                                                                          "data: https://www.google-analytics.com https://*.msecnd.net:*; style-src 'self' 'unsafe-inline'; font-src 'self' "\
                                                                          "data:; frame-src 'none'; object-src 'none'; connect-src *; media-src data:"
      expect(response.headers['content-type']).to eql "text/html"
      expect(response.headers['server']).to eql 'nginx'
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000; includeSubDomains; preload"
      expect(response.headers['vary']).to eql "Accept-Encoding"
      expect(response.headers['x-content-type-options']).to eql 'nosniff'
      expect(response.headers['x-dns-prefetch-control']).to eql 'off'
      expect(response.headers['x-download-options']).to eql 'noopen'
      expect(response.headers['x-frame-options']).to eql 'SAMEORIGIN'
      expect(response.headers['x-xss-protection']).to eql "0"
    end
  end


  context 'GET request to PUPIL API', :azure_api do
    it 'should return correct response headers' do
      request_helper = RequestHelper.new
      response = request_helper.api_home
      expect(response.code).to eql 200
      expect(response.headers['content-security-policy']).to eql "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors "\
                                                                          "'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' "\
                                                                          "https: 'unsafe-inline';upgrade-insecure-requests"
      expect(response.headers['x-dns-prefetch-control']).to eql "off"
      # expect(response.headers['expect-ct']).to eql "max-age=0"
      expect(response.headers['x-frame-options']).to eql "SAMEORIGIN"
      expect(response.headers['strict-transport-security']).to eql "max-age=31536000; includeSubDomains; preload"
      expect(response.headers['x-download-options']).to eql "noopen"
      expect(response.headers['x-content-type-options']).to eql "nosniff"
      expect(response.headers['x-permitted-cross-domain-policies']).to eql "none"
      expect(response.headers['referrer-policy']).to eql "no-referrer"
      expect(response.headers['x-xss-protection']).to eql "0"
      expect(response.headers['content-type']).to eql "application/json; charset=utf-8"
      expect(response.headers['cache-control']).to eql "no-store"
      expect(response.headers['pragma']).to eql "no-cache"
      expect(response.headers['connection']).to eql "close"
    end
  end

end
