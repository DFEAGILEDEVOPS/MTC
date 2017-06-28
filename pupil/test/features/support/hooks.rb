Before('@4_digit') do
  skip_this_scenario if AUTH == '5'
end

Before('@5_digit') do
  skip_this_scenario unless AUTH == '5'
end

After do |scenario|
  if (scenario.failed?)
    image_name = "screenshots/#{scenario.__id__}.png"
    save_screenshot(image_name, :full => true)
    embed(image_name, "image/png", "SCREENSHOT")
  end
end