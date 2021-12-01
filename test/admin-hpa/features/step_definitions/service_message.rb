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
  text = "# Heading\\r\\n\\r\\n**Bold text**\\r\\n\\r\\n*Italic text*\\r\\n\\r\\n> This is a quote\\r\\n\\r\\n* This\\r\\n* is\\r\\n* a bulleted list\\r\\n\\r\\n1. This\\r\\n2. is\\r\\n3. a numbered list\\r\\n\\r\\n[This is a link](http://www.google.com)\\r\\n\\r\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus lobortis vehicula sem, quis pulvinar sem tristique nec. Sed eget nulla velit.\\r\\n\\r\\nMaecenas tristique venenatis tempor. Sed faucibus, mi at euismod efficitur, eros enim semper est, vel auctor lacus libero euismod mi. Phasellus tristique nec tortor rhoncus hendrerit.\\r\\nSed porttitor mattis aliquet. Donec nisl ante, rhoncus nec commodo vitae, malesuada ac neque. Mauris fermentum arcu mollis velit tempor."
  @message = {title: 'Test title' + rand(54544564).to_s, message: text}
  create_message_page.create_message(@message[:title], @message[:message])
end

Then(/^the service message should be saved$/) do
  expect(manage_service_message_page).to have_flash_message
  expect(manage_service_message_page).to have_message
  expect(manage_service_message_page.message.text).to eql @message[:title]
  expect(manage_service_message_page).to have_remove_message
  db_record = SqlDbHelper.get_service_message(@message[:title])
  expect(db_record['title']).to eql @message[:title]
  expect(db_record['message']).to eql @message[:message].gsub("\\r\\n", "\r\n")
  redis_record = JSON.parse(REDIS_CLIENT.get('serviceMessage'))
  expect(JSON.parse(redis_record['value'])['title']).to eql @message[:title]
  expect(JSON.parse(redis_record['value'])['message']).to eql @message[:message].gsub("\\r\\n", "\r\n")
end


Given(/^I have created a service message$/) do
  step 'I am on the create service message page'
  step 'I submit the form with the service message I require'
  step 'the service message should be saved'
end

When(/^I decide to delete the message$/) do
  manage_service_message_page.remove_service_message
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

When(/^I navigate to school home page as a teacher$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
end

Then(/^service message is displayed as per design$/) do
  expect(school_landing_page).to have_service_message
  expect(school_landing_page.service_message.service_message_heading.text).to eql(@message[:title])
  expect(school_landing_page.service_message.service_message_text.text).to eql "Heading\nBold text\nItalic text\nThis is a quote\nThis\nis\na bulleted list\nThis\nis\na numbered list\nThis is a link\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus lobortis vehicula sem, quis pulvinar sem tristique nec. Sed eget nulla velit.\nMaecenas tristique venenatis tempor. Sed faucibus, mi at euismod efficitur, eros enim semper est, vel auctor lacus libero euismod mi. Phasellus tristique nec tortor rhoncus hendrerit. Sed porttitor mattis aliquet. Donec nisl ante, rhoncus nec commodo vitae, malesuada ac neque. Mauris fermentum arcu mollis velit tempor."
end
