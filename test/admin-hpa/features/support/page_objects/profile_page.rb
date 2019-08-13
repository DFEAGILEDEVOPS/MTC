class ProfilePage < SitePrism::Page
  set_url '/profile'

  element :logo, '.logo-text'
  element :heading, '.heading-medium'
  element :manage_check_forms, 'a[href="/test-developer/manage-check-forms"]'
  element :add_pupil, 'a[href="/school/pupil/add"]'
  element :manage_pupil, 'a[href="/school/manage-pupils"]'
  element :breadcrumb_v2, '.govuk-breadcrumbs'
  element :breadcrumb, '#content .breadcrumbs'
  element :home_v2, '.govuk-breadcrumbs__link', text: 'Home'
  element :home, '#content .breadcrumbs a', text: 'Home'
  section :phase_banner, PhaseBanner, '.phase-banner'


end
