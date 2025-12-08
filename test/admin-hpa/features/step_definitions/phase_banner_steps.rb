Then(/^I should see that we are in the (.+) development phase on the (.+) page$/) do |phase, page|
  expect(send("#{page}_page").phase_banner.phase_v2.text).to eql phase.upcase if (page == 'sign_in' || page == 'sign_in_failure' || page == 'school_landing' || page == 'pupil_register' || page == 'add_pupil' || page == 'edit_pupil' || page == 'view_form'  || page == 'upload_and_view_forms')
  expect(send("#{page}_page").phase_banner.phase.text).to eql phase.upcase unless (page == 'sign_in' || page == 'sign_in_failure' || page == 'school_landing' || page == 'pupil_register' || page == 'add_pupil' || page == 'edit_pupil' || page == 'view_form' || page == 'upload_and_view_forms')
end

Then(/^I should see a feedback link from the (.+) page$/) do |current_page|
  expect(send("#{current_page}_page").phase_banner.feedback.text).to eql "" unless (current_page == 'sign_in' || current_page == 'sign_in_failure' || current_page == 'school_landing' || current_page == 'pupil_register' || current_page == 'add_pupil' || current_page == 'edit_pupil' || current_page == 'upload_and_view_forms'|| current_page == 'view_form')
  expect(send("#{current_page}_page").phase_banner.feedback.has_link?).to be_truthy
  first_tab = page.windows.first
  send("#{current_page}_page").phase_banner.feedback.link.click
  expect(page.windows.size).to eql 2
  page.switch_to_window page.windows.first
  expect(page.windows.first).to eql first_tab
end
