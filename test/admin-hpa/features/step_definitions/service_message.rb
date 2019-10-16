Given(/^I am on the manage service message page$/) do
  step 'I have signed in with service-manager'
  admin_page.manage_service_message.click
end

Then(/^it should match the design$/) do
  expect(manage_service_message_page).to have_heading
  expect(manage_service_message_page).to have_info_text
  expect(manage_service_message_page).to have_create_message
  expect(manage_service_message_page).to have_no_message
end


Given(/^I am on the create service message page$/) do
  step 'I am on the manage service message page'
  manage_service_message_page.create_message.click
end

When(/^I submit the form with the service message I require$/) do
  @message = {title: 'Test title' + rand(54544564).to_s, message: 'Test message' + rand(45464).to_s}
  create_message_page.create_message(@message[:title], @message[:message])
end

Then(/^the service message should be saved$/) do
  expect(manage_service_message_page).to have_flash_message
  expect(manage_service_message_page).to have_message
  expect(manage_service_message_page.message.text).to eql @message[:title]
  expect(manage_service_message_page).to have_remove_message
  db_record = SqlDbHelper.get_service_message(@message[:title])
  expect(db_record['title']).to eql @message[:title]
  expect(db_record['message']).to eql @message[:message]
  redis_record = JSON.parse(REDIS_CLIENT.get('serviceMessage'))
  expect(redis_record['title']).to eql @message[:title]
  expect(redis_record['message']).to eql @message[:message]
end


Given(/^I have created a service message$/) do
  step 'I am on the create service message page'
  step 'I submit the form with the service message I require'
  step 'the service message should be saved'
end

When(/^I decide to delete the message$/) do
  manage_service_message_page.remove_message.click
end


Then(/^it should be removed from the system$/) do
  expect(manage_service_message_page).to have_flash_message
  expect(manage_service_message_page).to have_no_message
  db_record = SqlDbHelper.get_service_message(@message[:title])
  expect(db_record).to be_nil
  redis_record = REDIS_CLIENT.get('serviceMessage')
  expect(redis_record).to be_nil
end


Then(/^I should not be able to create another$/) do
  expect(manage_service_message_page.create_message).to be_disabled
end
