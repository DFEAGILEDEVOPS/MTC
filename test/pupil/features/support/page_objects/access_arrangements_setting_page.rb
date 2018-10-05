class AccessArrangementsSettingPage < SitePrism::Page
  set_url '/access-settings'

  element :heading, '.heading-xlarge', text: 'Your settings'
  element :information, '.lede', text: 'You have the following settings on your check'

  elements :access_arrangements_list, '.list li'
  element :sign_out, 'a[href="/sign-out"]', text: 'sign out'
  element :next_btn, '.button'

  def set_access_arrangement( pupil_id, new_time, access_arrangements_list)
    access_arrangmenets = access_arrangements_list.split(',')
    access_arrangmenets.each do |access_arr_type|
      case access_arr_type
        when 'Audible Time Alert'
          SqlDbHelper.set_pupil_access_arrangement(pupil_id, new_time, new_time, 1)
        when 'Remove on-screen number pad'
          SqlDbHelper.set_pupil_access_arrangement(pupil_id, new_time, new_time, 7)
      end
    end

  end



end