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
  @message_text_1 = "Lorem ipsum dolor sit amet"
  @message_text_2 = "Maecenas tristique venenatis tempor."
  text = "# Heading\\r\\n\\r\\n**Bold text**\\r\\n\\r\\n*Italic text*\\r\\n\\r\\n> This is a quote\\r\\n\\r\\n* This\\r\\n* is\\r\\n* a bulleted list\\r\\n\\r\\n1. This\\r\\n2. is\\r\\n3. a numbered list\\r\\n\\r\\n[This is a link](http://www.google.com)\\r\\n\\r\\n#{@message_text_1}\\r\\n\\r\\n#{@message_text_2}"
  @message = { title: 'Test title' + rand(54544564).to_s, message: text }
  @border_colour = 'Red'
  create_message_page.create_message(@message[:title], @message[:message], @border_colour)
end

Then(/^the service message should be saved$/) do
  expect(manage_service_message_page).to have_flash_message
  expect(manage_service_message_page).to have_message
  expect(manage_service_message_page.message[0].text).to eql @message[:title]
  expect(manage_service_message_page).to have_remove_message
  db_record = SqlDbHelper.get_service_message(@message[:title])
  expect(db_record['title']).to eql @message[:title]
  expect(db_record['message']).to eql @message[:message].gsub("\\r\\n", "\r\n")
  redis_record = JSON.parse(REDIS_CLIENT.get('serviceMessage'))
  expect(JSON.parse(redis_record['value'])['messages'].first['message'].split('<p>')[5]).to include @message_text_1
  expect(JSON.parse(redis_record['value'])['messages'].first['message'].split('<p>')[6]).to include @message_text_2
end

Given(/^I have created a service message$/) do
  step 'I am on the create service message page'
  step 'I submit the form with the service message I require'
  step 'the service message should be saved'
end


Given(/^I have created multiple service messages$/) do
  step 'I am on the create service message page'
  step 'I submit the form with the service message I require'
  @message_1 = @message
  create_message_page.load
  step 'I submit the form with the service message I require'
  @message_2 = @message
end

When(/^I decide to delete one of the messages$/) do
  manage_service_message_page.remove_specific_service_message(@message_1[:title])
end

Then(/^it should be removed from the system$/) do
  expect(manage_service_message_page).to have_flash_message
  db_record = SqlDbHelper.get_service_message(@message_1[:title])
  expect(db_record).to be_nil
  redis_record = REDIS_CLIENT.get('serviceMessage')
  redis_record = JSON.parse(redis_record)
  service_messages = JSON.parse(redis_record['value'])['messages']
  expect(service_messages.map {|message| message['title']}).to_not include @message_1[:title]
end

Then(/^I should be able to create another$/) do
  manage_service_message_page.create_message.click
  expect(create_message_page).to be_displayed
end

When(/^I navigate to school home page as a teacher$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
end

Then(/^service message is displayed as per design$/) do
  expect(school_landing_page).to have_service_message
  expect(school_landing_page.service_message.service_message_heading.text).to eql(@message[:title])
  expect(school_landing_page.service_message.service_message_text.text).to eql "Heading\nBold text\nItalic text\nThis is a quote\nThis\nis\na bulleted list\nThis\nis\na numbered list\nThis is a link\n#{@message_text_1}\n#{@message_text_2}"
  expect(all(".mtc-notification-banner-#{@border_colour.downcase}")).to_not be_empty
end

Given(/^I have previously created a service message$/) do
  step "I am on the create service message page"
  step "I submit the form with the service message I require"
  step "the service message should be saved"
end

When(/^I edit the existing service message$/) do
  manage_service_message_page.edit.click
  @message = { title: @message[:title] + " Updated", message: 'This is an updated message' }
  @border_colour = 'Red'
  create_message_page.create_message(@message[:title], @message[:message], @border_colour)
end

Then(/^the service message should be updated$/) do
  expect(manage_service_message_page).to have_flash_message
  expect(manage_service_message_page).to have_message
  expect(manage_service_message_page.message[0].text).to eql @message[:title]
  expect(manage_service_message_page).to have_remove_message
  db_record = SqlDbHelper.get_service_message(@message[:title])
  expect(db_record['title']).to eql @message[:title]
  expect(db_record['message']).to eql @message[:message].gsub("\\r\\n", "\r\n")
  redis_record = JSON.parse(REDIS_CLIENT.get('serviceMessage'))
  expect(JSON.parse(redis_record['value'])['messages'].first['title']).to eql @message[:title]
  expect(JSON.parse(redis_record['value'])['messages'].first['message']).to include @message[:message]
end

Given(/^I have created a service message with a (.+) border$/) do |colour|
  step 'I am on the create service message page'
  @message_text_1 = "Lorem ipsum dolor sit amet"
  @message_text_2 = "Maecenas tristique venenatis tempor."
  text = "# Heading\\r\\n\\r\\n**Bold text**\\r\\n\\r\\n*Italic text*\\r\\n\\r\\n> This is a quote\\r\\n\\r\\n* This\\r\\n* is\\r\\n* a bulleted list\\r\\n\\r\\n1. This\\r\\n2. is\\r\\n3. a numbered list\\r\\n\\r\\n[This is a link](http://www.google.com)\\r\\n\\r\\n#{@message_text_1}\\r\\n\\r\\n#{@message_text_2}"
  @message = { title: 'Test title' + rand(54544564).to_s, message: text }
  @border_colour = colour.capitalize
  create_message_page.create_message(@message[:title], @message[:message], @border_colour)
  step 'the service message should be saved'
end

Given(/^I have created a service message for the (.+)$/) do |specified_area|
  step 'I am on the create service message page'
  @message_text_1 = "Lorem ipsum dolor sit amet"
  text = "# Heading\\r\\n\\r\\n**Bold text**\\r\\n\\r\\n*Italic text*\\r\\n\\r\\n#{@message_text_1}"
  @message = { title: 'Test title' + rand(54544564).to_s, message: text }
  @border_colour = 'Red'
  create_message_page.create_message(@message[:title], @message[:message], @border_colour, specified_area)
end

When(/^I navigate to the (.+) area$/) do |specified_area|
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  case specified_area
  when 'access_arrangements_page'
    access_arrangements_page.load
  when 'declaration_page'
    declaration_page.load
  when 'tio_or_live_pins_page'
    tio_or_live_pins_page.load
  when 'group_pupils_page'
    group_pupils_page.load
  when 'pupil_register_page'
    pupil_register_page.load
  when 'pupil_status_page'
    pupil_status_page.load
  when 'pupils_not_taking_check_page'
    pupils_not_taking_check_page.load
  when 'restarts_page'
    restarts_page.load
  when 'school_landing_page'
    school_landing_page.load
  else
    fail "#{specified_area} has not been found"
  end
end

Then(/^I should only see the service message on the (.+)$/) do |specified_area|
  expect((send(specified_area).service_message.service_message_heading).text).to eql @message[:title]
  unless specified_area == 'access_arrangements_page'
    access_arrangements_page.load
    expect(access_arrangements_page).to_not have_service_message
  end
  unless specified_area == 'declaration_page'
    declaration_page.load
    expect(declaration_page).to_not have_service_message
  end
  unless specified_area == 'tio_or_live_pins_page'
    tio_or_live_pins_page.load
    expect(tio_or_live_pins_page).to_not have_service_message
  end
  unless specified_area == 'group_pupils_page'
    group_pupils_page.load
    expect(group_pupils_page).to_not have_service_message
  end
  unless specified_area == 'pupil_register_page'
    pupil_register_page.load
    expect(pupil_register_page).to_not have_service_message
  end
  unless specified_area == 'pupil_status_page'
    pupil_status_page.load
    expect(pupil_status_page).to_not have_service_message
  end
  unless specified_area == 'pupils_not_taking_check_page'
    pupils_not_taking_check_page.load
    expect(pupils_not_taking_check_page).to_not have_service_message
  end
  unless specified_area == 'restarts_page'
    restarts_page.load
    expect(restarts_page).to_not have_service_message
  end
  unless specified_area == 'school_landing_page'
    school_landing_page.load
    expect(school_landing_page).to_not have_service_message
  end
end
