Before do
  page.current_window.resize_to(1270,768)
end

Before('@4_digit') do
  skip_this_scenario if AUTH == '5'
end

Before('@5_digit') do
  skip_this_scenario unless AUTH == '5'
end

Before('@non_browserstack_compliant') do
  skip_this_scenario if Capybara.current_driver.to_s.include? 'bs'
end

After('@window_date_time_reset') do
  original = MongoDbHelper.get_check_window_via_name('Summer 2017')
  updated = original.each{ |key,str| original[@original_date_time.keys.first.to_s] = @original_date_time.values.first}
  collection=CLIENT[:checkwindows]
  collection.update_one({'_id' => original['_id']}, updated)
  p "Returned #{@original_date_time.keys.first.to_s} to #{@original_date_time.values.first}"
end

After do |scenario|
  if scenario.failed?
    page.save_screenshot("screenshots/#{Time.now.strftime("%H_%M_%S")}.png")
  end
end
