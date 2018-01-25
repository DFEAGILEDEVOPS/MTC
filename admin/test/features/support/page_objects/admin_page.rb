class AdminPage < SitePrism::Page
  set_url '/service-manager/home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge', text: 'Multiplication tables check for service managers'
  element :manage_check_windows, 'a', text: 'Manage check windows'
  element :manage_check_windows_text, 'p', text: 'Create and edit check administration windows'
  element :pupil_check_settings, "a[href='/service-manager/check-settings']", text: 'Settings on pupil check'
  element :pupil_check_settings_text, 'p', text: 'Change the settings within the pupil check'
  element :school_page_settings, "a", text: 'Settings on school pages'
  element :school_page_settings_text, 'p', text: 'Change the settings within the school pages'
  element :manage_access_arrangements, "a", text: 'Manage access arrangements'
  element :manage_access_arrangements_text, 'p', text: 'Approve or reject access arrangement requests'
  element :manage_restart_requests, "a", text: 'Manage restart requests'
  element :manage_restart_requests_text, 'p', text: 'Approve or reject restart requests'
  element :view_progress_reports, 'a', text: 'View progress reports'
  element :view_progress_reports_text, 'p', text: 'View reports of this check window'
  element :guidance, 'aside.support-column nav li a', text: 'Guidance'
  element :back_to_top, 'a', text: 'Back to top'

end
