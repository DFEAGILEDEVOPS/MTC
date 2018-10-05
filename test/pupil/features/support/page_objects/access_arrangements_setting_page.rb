class AccessArrangementsSettingPage < SitePrism::Page
  set_url '/access-settings'

  element :heading, '.heading-xlarge', text: 'Your settings'
  element :information, '.lede', text: 'You have the following settings on your check'

  elements :access_arrangements_list, '.list li'
  element :sign_out, 'a[href="/sign-out"]', text: 'sign out'
  element :next_btn, '.button'


end