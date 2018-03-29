Then(/^I should see that we are in the (.+) development phase on the (.+) page$/) do |phase,page|
  expect(send("#{page}_page").phase_banner.phase.text).to eql phase.upcase
end

Then(/^I should see a new tab open when i want to provide feedback link from the (.+) page$/) do |current_page|
  expect(send("#{current_page}_page").phase_banner.feedback.text).to eql "BETAThis is a new service – your feedback will help us to improve it."
  expect(send("#{current_page}_page").phase_banner.feedback).to have_link
  first_tab = page.windows.first
  send("#{current_page}_page").phase_banner.feedback.link.click
  feedback_page_title = 'Multiplication tables check June 2017 trial survey'
  page.switch_to_window {title == feedback_page_title}
  expect(page.title).to eql feedback_page_title
  expect(page.windows.size).to eql 2
  page.current_window.close
  page.switch_to_window page.windows.first
  expect(page.windows.first).to eql first_tab
end
