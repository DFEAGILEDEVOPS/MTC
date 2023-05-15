class AdminPage < SitePrism::Page
  set_url '/service-manager/home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'MTC Administration Homepage'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.govuk-heading-xl', text: 'Multiplication tables check for service managers'
  element :manage_check_windows, 'a', text: 'Manage check windows'
  element :updated_manage_check_windows, 'a[href="/check-window/manage-check-windows"]', text: 'Manage check windows'
  element :manage_check_windows_text, 'p', text: 'Create, edit or remove check windows'
  element :upload_pupil_census, 'a', text: 'Upload pupil census'
  element :upload_pupil_census_text, 'p', text: 'Enter pupil data into the check'
  element :pupil_check_settings, "a[href='/service-manager/check-settings']", text: 'Settings on pupil check'
  element :pupil_check_settings_text, 'p', text: 'Change the settings within the pupil check'
  element :mod_schools_settings, 'a', text: "Settings for Ministry of Defence schools (MOD)"
  element :mod_schools_settings_text, 'p', text: 'Set timezones, convert and remove school listed as MOD'
  element :school_page_settings_text, 'p', text: 'Change the settings within the school pages'
  element :manage_service_message, 'a', text: 'Manage service message'
  element :manage_service_message_text, 'p', text: 'Add or delete a global service message for the school homepage'
  element :school_search, 'a', text: 'Manage organisations'
  element :school_search_text, 'p', text: 'Upload, add or edit schools'
  element :pupil_search, 'h2 a', text: 'Pupil Search'
  element :pupil_search_text, 'p', text: 'Administer Pupils'



  element :manage_access_arrangements, "a", text: 'Manage access arrangements'
  element :manage_access_arrangements_text, 'p', text: 'Approve or reject access arrangement requests'
  element :manage_restart_requests, "a", text: 'Manage restart requests'
  element :manage_restart_requests_text, 'p', text: 'Approve or reject restart requests'
  element :view_progress_reports, 'a', text: 'View progress reports'
  element :view_progress_reports_text, 'p', text: 'View reports of this check window'
  element :guidance, 'a', text: 'Read the guidance and watch videos'
  element :back_to_top, 'a', text: 'Back to top'

end
