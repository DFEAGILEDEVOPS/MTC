Given(/^I am on the sign in page for the first time$/) do
  Capybara.current_session.driver.browser.manage.delete_all_cookies
  visit current_url
end

Then(/^I should see the cookie banner$/) do
  expect(sign_in_page.cookies_banner).to be_visible
  expect(sign_in_page.cookies_banner).to have_heading
  expect(sign_in_page.cookies_banner).to have_cookie_text
  expect(sign_in_page.cookies_banner).to have_cookie_link
  expect(sign_in_page.cookies_banner).to have_accept_all
  expect(sign_in_page.cookies_banner).to have_cookie_prefs
end

Then(/^I should not see the cookie banner$/) do
  expect(pupil_register_page.cookies_banner).to_not be_visible
  cookie_policy = Capybara.current_session.driver.browser.manage.cookie_named('cookies_policy')
  cookie_prefs = Capybara.current_session.driver.browser.manage.cookie_named('cookies_preferences_set')
  expect(JSON.parse cookie_policy[:value]).to eql({"essential"=>true, "settings"=>true, "usage"=>true, "campaigns"=>true})
  expect(cookie_prefs[:value]).to eql 'true'
end


When(/^I select the cookies link$/) do
  sign_in_page.cookies.click
end

Then(/^I should be taken to the cookies prefs page$/) do
 expect(cookies_form_page).to have_heading
 expect(cookies_form_page).to have_cookies_saved_text
 expect(cookies_form_page).to have_cookies_usage_text
 expect(cookies_form_page).to have_settings_heading
 expect(cookies_form_page).to have_website_use_heading
 expect(cookies_form_page).to have_necessary_cookies_heading
 expect(cookies_form_page).to have_on
 expect(cookies_form_page).to have_off
 expect(cookies_form_page).to have_mtc_cookies_link
 expect(cookies_form_page).to have_save
end

And(/^the session ID cookie is set$/) do
  @session_cookie_before_logout = Capybara.current_session.driver.browser.manage.all_cookies.find{|cookie| cookie[:name] == "mtc-admin-session-id" }
  expect(@session_cookie_before_logout).to_not be_nil
end

Then(/^the value of the session ID should change$/) do
  session_cookie_after_logout = Capybara.current_session.driver.browser.manage.all_cookies.find{|cookie| cookie[:name] == "mtc-admin-session-id" }
  expect(session_cookie_after_logout).to_not be_nil
  expect(@session_cookie_before_logout[:value]).to_not eql session_cookie_after_logout[:value]
end
