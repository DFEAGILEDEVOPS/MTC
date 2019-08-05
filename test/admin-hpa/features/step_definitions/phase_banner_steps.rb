Then(/^I should see that we are in the (.+) development phase on the (.+) page$/) do |phase,page|
  expect(send("#{page}_page").phase_banner.phase_v2.text).to eql phase.upcase if(page == 'sign_in'||page == 'sign_in_failure'||page == 'school_landing')
  expect(send("#{page}_page").phase_banner.phase.text).to eql phase.upcase unless (page == 'sign_in'||page == 'sign_in_failure'||page == 'school_landing')
end

Then(/^I should see a new tab open when i want to provide feedback link from the (.+) page$/) do |current_page|
  expect(send("#{current_page}_page").phase_banner.feedback.text).to eql "This is a new service – your feedback will help us to improve it."  if (current_page == 'sign_in'||current_page == 'sign_in_failure'||current_page == 'school_landing')
  expect(send("#{current_page}_page").phase_banner.feedback.text).to eql "BETAThis is a new service – your feedback will help us to improve it."  unless (current_page == 'sign_in'||current_page == 'sign_in_failure'||current_page == 'school_landing')
  expect(send("#{current_page}_page").phase_banner.feedback).to have_link
  first_tab = page.windows.first
  send("#{current_page}_page").phase_banner.feedback.link.click
  feedback_page_title = 'Multiplication Tables Check survey 2019'
  page.driver.browser.switch_to.window(page.windows.last.handle)
  expect(page.title).to eql feedback_page_title
  expect(page.windows.size).to eql 2
  page.current_window.close
  page.switch_to_window page.windows.first
  expect(page.windows.first).to eql first_tab
end
