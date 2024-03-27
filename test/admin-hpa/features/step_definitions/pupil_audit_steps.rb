Then(/^I should see an audit entry for adding a pupil$/) do
  pupil_audit_record = SqlDbHelper.pupil_audit_record(@stored_pupil_details['id']).first
  parsed_new_data = JSON.parse pupil_audit_record['newData']
  parsed_audit_record = pupil_audit_record.each {|k, v| pupil_audit_record['newData'] = parsed_new_data}
  expect(parsed_audit_record['auditOperationTypeLookup_id']).to eql 1
  expect(parsed_audit_record['newData']['id']).to eql @stored_pupil_details['id']
  expect(parsed_audit_record['newData']['school_id']).to eql @stored_pupil_details['school_id']
  expect(parsed_audit_record['newData']['foreName']).to eql @stored_pupil_details['foreName']
  expect(parsed_audit_record['newData']['middleNames']).to eql @stored_pupil_details['middleNames']
  expect(parsed_audit_record['newData']['lastName']).to eql @stored_pupil_details['lastName']
  expect(parsed_audit_record['newData']['gender']).to eql @stored_pupil_details['gender']
  expect(Time.parse(parsed_audit_record['newData']['dateOfBirth']).strftime("%Y-%m-%dT%H:%M:%S")).to eql @stored_pupil_details['dateOfBirth'].strftime("%Y-%m-%dT%H:%M:%S")
  expect(parsed_audit_record['newData']['upn']).to eql @stored_pupil_details['upn']
  expect(parsed_audit_record['newData']['isTestAccount']).to eql @stored_pupil_details['isTestAccount']
  expect(parsed_audit_record['newData']['urlSlug']).to eql @stored_pupil_details['urlSlug']
  expect(parsed_audit_record['newData']['checkComplete']).to eql @stored_pupil_details['checkComplete']
  expect(parsed_audit_record['newData']['restartAvailable']).to eql @stored_pupil_details['restartAvailable']
  expect(parsed_audit_record['newData']['foreNameAlias']).to eql @stored_pupil_details['foreNameAlias']
  expect(parsed_audit_record['newData']['lastNameAlias']).to eql @stored_pupil_details['lastNameAlias']
  expect(parsed_audit_record['newData']['isDiscretionaryRestartAvailable']).to eql @stored_pupil_details['isDiscretionaryRestartAvailable']
  expect(parsed_audit_record['newData']['frozen']).to eql @stored_pupil_details['frozen']
  expect(parsed_audit_record['newData']['lastModifiedBy_userId']).to eql @stored_pupil_details['lastModifiedBy_userId']
  expect(parsed_audit_record['pupil_id']).to eql @stored_pupil_details['id']
  expect(parsed_audit_record['operationBy_userId']).to eql @school_user['id']
end


Given(/^I have edited a pupil$/) do
  step 'I want to edit a previously added pupil'
  step 'I update with valid pupil data'
  step 'this should be saved'
end

Then(/^I should see an audit entry for editing a pupil$/) do
  pupil_audit_record = SqlDbHelper.pupil_audit_record(@stored_pupil_details['id']).select {|row| row['auditOperationTypeLookup_id'] == 2}.first
  parsed_new_data = JSON.parse pupil_audit_record['newData']
  parsed_audit_record = pupil_audit_record.each {|k, v| pupil_audit_record['newData'] = parsed_new_data}
  expect(parsed_audit_record['auditOperationTypeLookup_id']).to eql 2
  expect(parsed_audit_record['newData']['id']).to eql @stored_pupil_details['id']
  expect(parsed_audit_record['newData']['school_id']).to eql @stored_pupil_details['school_id']
  expect(parsed_audit_record['newData']['foreName']).to eql @stored_pupil_details['foreName']
  expect(parsed_audit_record['newData']['middleNames']).to eql @stored_pupil_details['middleNames']
  expect(parsed_audit_record['newData']['lastName']).to eql @stored_pupil_details['lastName']
  expect(parsed_audit_record['newData']['gender']).to eql @stored_pupil_details['gender']
  expect(Time.parse(parsed_audit_record['newData']['dateOfBirth']).strftime("%Y-%m-%dT%H:%M:%S")).to eql @stored_pupil_details['dateOfBirth'].strftime("%Y-%m-%dT%H:%M:%S")
  expect(parsed_audit_record['newData']['upn']).to eql @stored_pupil_details['upn']
  expect(parsed_audit_record['newData']['isTestAccount']).to eql @stored_pupil_details['isTestAccount']
  expect(parsed_audit_record['newData']['urlSlug']).to eql @stored_pupil_details['urlSlug']
  expect(parsed_audit_record['newData']['checkComplete']).to eql @stored_pupil_details['checkComplete']
  expect(parsed_audit_record['newData']['restartAvailable']).to eql @stored_pupil_details['restartAvailable']
  expect(parsed_audit_record['newData']['foreNameAlias']).to eql @stored_pupil_details['foreNameAlias']
  expect(parsed_audit_record['newData']['lastNameAlias']).to eql @stored_pupil_details['lastNameAlias']
  expect(parsed_audit_record['newData']['isDiscretionaryRestartAvailable']).to eql @stored_pupil_details['isDiscretionaryRestartAvailable']
  expect(parsed_audit_record['newData']['frozen']).to eql @stored_pupil_details['frozen']
  expect(parsed_audit_record['newData']['lastModifiedBy_userId']).to eql @stored_pupil_details['lastModifiedBy_userId']
  expect(parsed_audit_record['pupil_id']).to eql @stored_pupil_details['id']
  expect(parsed_audit_record['operationBy_userId']).to eql @school_user['id']
end


Given(/^I have added multiple pupils$/) do
  @pupil_ids_added = @upns_for_school.map {|upn| SqlDbHelper.pupil_details(upn, @school_id)['id']}
end


Then(/^I should see audit entries for multiple pupils$/) do
  expect(@upns_for_school.count).to eql @pupil_ids_added.map {|id| SqlDbHelper.pupil_audit_record(id).first}.count
end


Then(/^I should see audit entries for the group entries$/) do
  pupil_ids_array = SqlDbHelper.get_pupil_ids_from_group(@group_name)
  pupil_audit_records = pupil_ids_array.map {|id| SqlDbHelper.pupil_audit_record(id)}.flatten.select {|row| row['auditOperationTypeLookup_id'] == 2}
  expect(pupil_ids_array.size).to eql pupil_audit_records.size
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records.map {|record| record['newData']['id']}.sort).to eql pupil_ids_array.sort
  expect(array_of_parsed_records.map {|record| record['newData']['group_id']}.uniq.first).to eql SqlDbHelper.find_group(@group_name)['id']
end


Given(/^I add pupils to a group$/) do
  step 'I want to edit a previously added group'
  step 'I should be able to add and remove pupils'
end

Then(/^I should see audit entries for the group changes$/) do
  pupil_ids_array = SqlDbHelper.get_pupil_ids_from_group(@group_name)
  pupil_audit_records = pupil_ids_array.map {|id| SqlDbHelper.pupil_audit_record(id)}.flatten.select {|row| row['auditOperationTypeLookup_id'] == 2}
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records.map {|record| record['newData']['id']}.uniq.sort).to eql pupil_ids_array.sort
  expect(array_of_parsed_records.map {|record| record['newData']['group_id']}.uniq.first).to eql SqlDbHelper.find_group(@group_name)['id']
end


Given(/^I have removed a group$/) do
  step 'I have created a group'
  @pupil_ids_array = SqlDbHelper.get_pupil_ids_from_group(@group_name)
  step 'I should be able to remove the group'
end

Then(/^I should see audit entries for the removal of the group$/) do
  pupil_audit_records = @pupil_ids_array.map {|id| SqlDbHelper.pupil_audit_record(id)}.flatten.select {|row| row['auditOperationTypeLookup_id'] == 2}.sort_by{|hash| hash['id']}
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records[0]['newData']['group_id']).to_not be_nil
  expect(array_of_parsed_records[1]['newData']['group_id']).to be_nil

end


Then(/^I should see a audit entry for the frozen pupil$/) do
  pupil_audit_records = SqlDbHelper.pupil_audit_record(@pupil_details['id'])
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records[0]['newData']['frozen']).to be false
  expect(array_of_parsed_records[1]['newData']['frozen']).to be true
end


Given(/^I have a pupil not taking a check for (.*)$/) do |reason|
  step 'I am on the pupil reason page for new pupil'
  step "I add #{reason} as a reason for a particular pupil"
  step "the #{reason} reason should be stored against the pupils"
end

Then(/^I should see a audit entry for the pupil not taking the check for (.*)$/) do |reason|
  pupil_audit_records = SqlDbHelper.pupil_audit_record(@pupil['id'])
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records[0]['newData']['attendanceId']).to be_nil
  expect(array_of_parsed_records[1]['newData']['attendanceId']).to eql @attendance_code['id']
end


Then(/^I should see a audit entry for the completed check$/) do
  wait_until(10,2){SqlDbHelper.pupil_audit_record(@stored_pupil_details['id']).size > 2}
  pupil_audit_records = SqlDbHelper.pupil_audit_record(@stored_pupil_details['id'])
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records[0]['newData']['checkComplete']).to be false
  expect(array_of_parsed_records[1]['newData']['currentCheckId']).to eql SqlDbHelper.check_details(@stored_pupil_details['id'])['id']
  expect(array_of_parsed_records[1]['newData']['checkComplete']).to be false
  expect(array_of_parsed_records[2]['newData']['currentCheckId']).to eql SqlDbHelper.check_details(@stored_pupil_details['id'])['id']
  expect(array_of_parsed_records[2]['newData']['checkComplete']).to be true
end


Given(/^I have a pupil who has a restart$/) do
  step 'I submitted pupils for Restart using reason Classroom disruption'
  sleep 5
end

Then(/^I should see a audit entry for the pupil with a restart$/) do
  pupil_audit_records = SqlDbHelper.pupil_audit_record(@pupil_id).flatten.select {|row| row['auditOperationTypeLookup_id'] == 2}.sort_by{|hash| hash['id']}
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  p array_of_parsed_records
  expect(array_of_parsed_records.last['newData']['restartAvailable']).to be true
  expect(array_of_parsed_records.last['newData']['isDiscretionaryRestartAvailable']).to be false
end


Then(/^I should see a audit entry for the pupil with a discretionary restart$/) do
  wait_until(10,2){SqlDbHelper.pupil_audit_record(@pupil_id).size >= 8}
  pupil_audit_records = SqlDbHelper.pupil_audit_record(@pupil_id).flatten.select {|row| row['auditOperationTypeLookup_id'] == 2}.sort_by{|hash| hash['id']}
  array_of_parsed_records = []
  pupil_audit_records.each do |record|
    parsed_new_data = JSON.parse record['newData']
    parsed_audit_record = record.each {|k, v| record['newData'] = parsed_new_data}
    array_of_parsed_records << parsed_audit_record
  end
  expect(array_of_parsed_records.select {|record| record['newData']['isDiscretionaryRestartAvailable'] == true}). to_not be_nil
end


Given(/^I have a pupil with a discretionary restart$/) do
  step 'I submitted pupils for Restart'
  sleep 5
  step 'Pupil has taken a 2nd restart'
  sleep 5
  step 'Pupil has taken a 2nd check'
  sleep 5
  step "I should see the Restart Status 'Maximum number of restarts taken' for the pupil"
  step "I view the pupils history using the sta admin role"
  step "I apply the discretionary restart"
end
