class AdminPage < SitePrism::Page
  set_url '/administrator'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge', text: 'Multiplication tables check for service managers'
  element :manage_check_windows, 'a', text: 'Manage check windows'
  element :manage_check_windows_text, 'p', text: 'Create and edit check administration windows'
  element :check_settings, "a[href='/administrator/check-settings']", text: 'Adjust question timings'
  element :check_settings_text, "p", text: 'Change the setting of the check, for example timings of questions.'
  element :view_progress_reports, 'a', text: 'View progress reports'
  element :view_progress_reports_text, 'p', text: 'View reports of this check window.'
  element :manage_retake_requests, 'a', text: 'Manage retake requests'
  element :manage_retake_requests_text, 'p', text: 'View retake requests and approve or reject.'
  element :guidance, "h3 + .list li a", text: 'Guidance'
  element :back_to_top, "a", text: 'Back to top'

end
