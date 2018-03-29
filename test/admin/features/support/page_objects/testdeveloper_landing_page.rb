class TestdeveloperLandingPage < SitePrism::Page
  set_url '/test-developer/home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge', text: 'Multiplication tables check for test development'
  element :upload_and_view_forms, 'a', text: 'Upload and view forms'
  element :upload_and_view_forms_text, 'p', text: 'Add, view, remove and edit check forms'
  element :assign_forms_to_check_windows, 'a', text: 'Assign forms to check windows'
  element :assign_forms_to_check_windows_text, 'p', text: 'Select uploaded forms and assign them to check windows'
  element :guidance, 'aside.support-column nav li a', text: 'Guidance'
  element :back_to_top, 'a', text: 'Back to top'

end