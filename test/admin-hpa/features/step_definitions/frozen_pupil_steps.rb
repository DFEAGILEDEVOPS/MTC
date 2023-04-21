Given(/^the service manager has set a pupil to be frozen$/) do
  pupil_upn = @upns_for_school.sample
  @pupil_details = SqlDbHelper.pupil_details(pupil_upn, @school_id)
  freeze_pupil(pupil_upn, @school_id)
end

When(/^I view the pupil register page$/) do
  step "I am logged in"
  step "I am on the Pupil Register page"
end

Then(/^the frozen pupil should be read only$/) do
  expect(pupil_register_page.find_pupil_row(@pupil_details['foreName'])).to_not have_edit_pupil_link
end

When(/^the service manager has set a pupil from the group to be frozen$/) do
  pupil_name = @pupil_group_array.sample
  @pupil_details = SqlDbHelper.pupil_details_using_names(pupil_name, pupil_name, @school_id)
  freeze_pupil(@pupil_details['upn'], @school_id)
  expect(SqlDbHelper.get_pupil_ids_from_group(@group_name)).to include @pupil_details['id']
end

Then(/^the frozen pupil can be removed from the group$/) do
  step 'I am logged in'
  group_pupils_page.load
  previoulsy_created_group = group_pupils_page.group_list.rows.find {|row| row.group_name.text.include? @group_name}
  previoulsy_created_group.group_name.click
  frozen_pupil_row = add_edit_groups_page.find_pupil_row(@pupil_details['foreName'])
  frozen_pupil_row.checkbox.click
  add_edit_groups_page.sticky_banner.confirm.click
  expect(group_pupils_page.info_message.text).to eql "Changes made to '#{@group_name}'"
  expect(SqlDbHelper.get_pupil_ids_from_group(@group_name)).to_not include @pupil_details['id']
end

Then(/^the frozen pupil can be added to a group$/) do
  step 'I have a group of pupils'
  expect(SqlDbHelper.get_pupil_ids_from_group(@group_name)).to_not include @pupil_details['id']
  group_pupils_page.load
  previoulsy_created_group = group_pupils_page.group_list.rows.find {|row| row.group_name.text.include? @group_name}
  previoulsy_created_group.group_name.click
  frozen_pupil_row = add_edit_groups_page.find_pupil_row(@pupil_details['foreName'])
  frozen_pupil_row.checkbox.click
  add_edit_groups_page.sticky_banner.confirm.click
  expect(group_pupils_page.info_message.text).to eql "Changes made to '#{@group_name}'"
  expect(SqlDbHelper.get_pupil_ids_from_group(@group_name)).to include @pupil_details['id']
end

Then(/^I should see the frozen pupil is read only$/) do
  frozen_pupil_row = pupils_not_taking_check_page.pupil_list.rows.find {|row| row.name.text.include?  @pupil_details['foreName']}
  expect(frozen_pupil_row).to_not have_remove
  expect(frozen_pupil_row.reason.text).to eql "Results annulled"
end


Then(/^the frozen pupil is not in the list of available pupils$/) do
  expect(pupil_reason_page.pupil_list.rows.find {|row| row.name.text.include? @pupil_details['foreName']}).to be_nil
end


Given(/^I am about to submit a pupil for not taking the check$/) do
  step "I am on the pupil reason page"
  step "I select a reason"
  step "I select a pupil"
  step "I should see a sticky banner"
end


But(/^the pupil is frozen before the submission takes place$/) do
  pupil_name = @pupil.name.text.split(',').first
  @pupil_details = SqlDbHelper.pupil_details_using_names(pupil_name, pupil_name, @school_id)
  SqlDbHelper.set_pupil_as_frozen(@pupil_details['id'], 7)
  REDIS_CLIENT.del "pupilRegisterViewData:#{@school_id}"
  pupil_reason_page.sticky_banner.confirm.click
end

Then(/^a error is displayed$/) do
  expect(page.text).to include 'An error occurred'
end


When(/^I search for the frozen pupil$/) do
  step "I am logged in"
  access_arrangements_page.load
  access_arrangements_page.select_pupil_and_arrangement_btn.click
  step "I search for pupil '#{@pupil_details['foreName']}'"
end


Then(/^the search list should be empty$/) do
  expect(select_access_arrangements_page.auto_search_list[0].text).to eql 'No results found'
end


Given(/^I am about to apply a AA to a pupil$/) do
  pupil_upn = @upns_for_school.sample
  @pupil_details = SqlDbHelper.pupil_details(pupil_upn, @school_id)
  step 'I am on the select access arrangements page'
  @pupil_name = "#{@pupil_details['lastName']}, #{@pupil_details['foreName']}"
  select_access_arrangements_page.search_pupil.set(@pupil_name.gsub(',', ''))
  select_access_arrangements_page.auto_search_list[0].click
  @access_arrangement_name = "Audible time alert"
  select_access_arrangements_page.select_access_arrangement(@access_arrangement_name)
end

But(/^the pupil is frozen before the AA submission takes place$/) do
  SqlDbHelper.set_pupil_as_frozen(@pupil_details['id'], 7)
  REDIS_CLIENT.del "pupilRegisterViewData:#{@school_id}"
  select_access_arrangements_page.save.click
end


Then(/^they are not eligible for a TIO pin$/) do
  step "I am logged in"
  navigate_to_pupil_list_for_pin_gen('tio')
  pupils_from_page = generate_tio_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_details['foreName'])).to be_falsy, "#{@pupil_details['foreName']} is displayed in the list ... Expected - It Shouldn't"
end


Then(/^they are not eligible for a live pin$/) do
  step "I am logged in"
  navigate_to_pupil_list_for_pin_gen('live')
  pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_details['foreName'])).to be_falsy, "#{@pupil_details['foreName']} is displayed in the list ... Expected - It Shouldn't"
end


Then(/^I should see the frozen pupil$/) do
  pupil_status_page.not_taking_checks.count.click
  expect(pupil_status_page.not_taking_checks_details.pupil_list.pupil_row.first.names.text).to eql @pupil_details['lastName'] + ", " + @pupil_details['foreName']
  expect(pupil_status_page.not_taking_checks_details.pupil_list.pupil_row.first.status.text).to eql "Results annulled"
end


When(/^I navigate to the pupil status page$/) do
  step "I am logged in"
  step "I am on the Pupil Status page"
end


Given(/^a pupil completes a check$/) do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  expect(restarts_page.pupil_list.rows.first.name.text).to eql  @details_hash[:last_name] + ", " + @details_hash[:first_name]
end

But(/^the pupil is frozen straight after completion$/) do
  SqlDbHelper.set_pupil_as_frozen(@pupil_id, 7)
  REDIS_CLIENT.del "pupilRegisterViewData:#{@school_id}"
end


Then(/^the pupil is not eligble for a restart$/) do
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  expect(restarts_page).to have_no_pupils
end


Given(/^I applied a restart to a pupil$/) do
  step 'I submitted pupils for Restart'
  expect(restarts_page.restarts_pupil_list.rows.first).to have_remove_restart
end


When(/^the pupil is frozen$/) do
  SqlDbHelper.set_pupil_as_frozen(@pupil_id, 7)
  REDIS_CLIENT.del "pupilRegisterViewData:#{@school_id}"
end


Then(/^the restart cannot be removed$/) do
  restarts_page.restarts_pupil_list.rows.first.remove_restart.click
  step 'a error is displayed'
end


Then(/^the AA cannot be edited$/) do
  access_arrangements_page.pupil_list.rows.first.edit.click
  select_access_arrangements_page.save.click
  step 'a error is displayed'
end


Given(/^a pupil has an existing AA$/) do
  step "I have selected access arrangement 'Audible time alert' for a pupil"
  @pupil_id = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id']
end


Then(/^the service manager should be able to undo the freeze$/) do
  undo_frozen_pupil(@pupil_details['upn'], @school_id)
  step "I am logged in"
  step "I am on the Pupil Register page"
  expect(pupil_register_page.find_pupil_row(@pupil_details['foreName'])).to have_edit_pupil_link
  pupils_not_taking_check_page.load
  expect(pupils_not_taking_check_page).to have_no_pupils_listed_message
  pupils_not_taking_check_page.load
  step 'I want to add a reason'
  expect(pupil_reason_page.pupil_list.rows.find {|row| row.name.text.include? @pupil_details['foreName']}).to_not be_nil
  navigate_to_pupil_list_for_pin_gen('tio')
  pupils_from_page = generate_tio_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page).to include "#{@pupil_details['lastName']}, #{@pupil_details['foreName']}"
  navigate_to_pupil_list_for_pin_gen('live')
  pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page).to include "#{@pupil_details['lastName']}, #{@pupil_details['foreName']}"
end


Given(/^a pupil has been frozen after completing a check$/) do
  step 'a pupil completes a check'
  freeze_pupil(@details_hash[:upn], @school_id)
end


When(/^the annulment is removed$/) do
  undo_frozen_pupil(@details_hash[:upn], @school_id)
end


Then(/^the pupil should be eligible for a restart$/) do
  step "I am logged in"
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  expect(restarts_page.find_pupil_row(@details_hash[:first_name])).to_not be_nil
end


Given(/^a frozen pupil who had an unconsumed restart$/) do
  step 'I applied a restart to a pupil'
  freeze_pupil(@details_hash[:upn], @school_id)
end

Then(/^the pupil should be able to remove the restart$/) do
  step "I am logged in"
  restarts_page.load
  restarts_page.restarts_pupil_list.rows.first.remove_restart.click
  @time_removed = Time.now.utc
  step 'I should see a flash message to state the pupil has been removed from restart'
end

Given(/^a pupil who had a reason for not taking the check and was then frozen$/) do
  step 'I am on the pupil reason page for new pupil'
  step 'I add Incorrect registration as a reason for a particular pupil'
  expect(pupils_not_taking_check_page).to have_flash_message
  expect(pupils_not_taking_check_page.flash_message.text).to eql '1 reason updated'
  hightlighted_row = pupils_not_taking_check_page.pupil_list.rows.find {|row| row.has_highlight?}
  expect(hightlighted_row.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
  expect(hightlighted_row.text).to include @reason
  freeze_pupil(@details_hash[:upn], @school_id)
  step "I am logged in"
  pupils_not_taking_check_page.load
  frozen_pupil_row = pupils_not_taking_check_page.pupil_list.rows.find {|row| row.name.text.include?  @details_hash[:first_name]}
  expect(frozen_pupil_row).to_not have_remove
  expect(frozen_pupil_row.reason.text).to eql "Results annulled"
end

Then(/^the pupil is returned to not taking the check for the reason that was initially selected$/) do
  step "I am logged in"
  pupils_not_taking_check_page.load
  pupil_row = pupils_not_taking_check_page.pupil_list.rows.find {|row| row.name.text.include?  @details_hash[:first_name]}
  expect(pupil_row).to have_remove
  expect(pupil_row.reason.text).to eql @reason
end

Given(/^a pupil completes a check and then is frozen$/) do
  step 'a pupil completes a check'
  freeze_pupil(@details_hash[:upn], @school_id)
  step "I am logged in"
  step "I am on the Pupil Status page"
  pupil_status_page.not_taking_checks.count.click
  expect(pupil_status_page.not_taking_checks_details.pupil_list.pupil_row.first.names.text).to eql @details_hash[:last_name] + ", " + @details_hash[:first_name]
  expect(pupil_status_page.not_taking_checks_details.pupil_list.pupil_row.first.status.text).to eql "Results annulled"
end


Then(/^the pupils previous state of complete should be reinstated$/) do
  step 'I navigate to the pupil status page'
  pupil_status_page.completed_checks.count.click
  expect(pupil_status_page.completed_checks_details.pupil_list.pupil_row.first.names.text).to eql @details_hash[:last_name] + ", " + @details_hash[:first_name]
  expect(pupil_status_page.completed_checks_details.pupil_list.pupil_row.first.status.text).to eql "Complete"
end


Given(/^a pupil has a live pin generated and then is frozen$/) do
  step "I have generated a live pin for a pupil"
  freeze_pupil(@details_hash[:upn], @school_id)
  step "I am logged in"
  navigate_to_pupil_list_for_pin_gen('live')
  pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page).to_not include @details_hash[:last_name] + ", " + @details_hash[:first_name]
  view_and_print_live_pins_page.load
  expect(view_and_print_live_pins_page).to_not have_pupil_list
end


Then(/^the pupils previous state of having a live pin generated is reinstated$/) do
  step "I am logged in"
  navigate_to_pupil_list_for_pin_gen('live')
  pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page).to_not include @details_hash[:last_name] + ", " + @details_hash[:first_name]
  view_and_print_live_pins_page.load
  expect(view_and_print_live_pins_page.pupil_list.rows.first.name.text).to eql @details_hash[:last_name] + ", " + @details_hash[:first_name]
  expect(view_and_print_live_pins_page.pupil_list.rows.first.pin.text).to eql @pupil_credentials[:pin]
  expect(view_and_print_live_pins_page.pupil_list.rows.first.school_password.text).to eql @pupil_credentials[:school_password]
end


Given(/^a pupil has a tio pin generated and then is frozen$/) do
  step "I have generated a familiarisation pin for a pupil"
  freeze_pupil(@details_hash[:upn], @school_id)
  step "I am logged in"
  navigate_to_pupil_list_for_pin_gen('tio')
  pupils_from_page = generate_tio_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page).to_not include @details_hash[:last_name] + ", " + @details_hash[:first_name]
  view_and_print_tio_pins_page.load
  expect(view_and_print_live_pins_page).to_not have_pupil_list
end


Then(/^the pupils previous state of having a tio pin generated is reinstated$/) do
  step "I am logged in"
  navigate_to_pupil_list_for_pin_gen('tio')
  pupils_from_page = generate_tio_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page).to_not include @details_hash[:last_name] + ", " + @details_hash[:first_name]
  view_and_print_tio_pins_page.load
  expect(view_and_print_tio_pins_page.pupil_list.rows.first.name.text).to eql @details_hash[:last_name] + ", " + @details_hash[:first_name]
  expect(view_and_print_tio_pins_page.pupil_list.rows.first.pin.text).to eql @pupil_credentials[:pin]
  expect(view_and_print_tio_pins_page.pupil_list.rows.first.school_password.text).to eql @pupil_credentials[:school_password]
end
