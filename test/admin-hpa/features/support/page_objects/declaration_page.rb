class DeclarationPage < SitePrism::Page

  set_url '/attendance/declaration-form'

  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.govuk-heading-xl', text: "Headteacher's declaration form"
  element :confirm_hdf, '.multiple-choice #confirmYes'
  element :decline_hdf, '.multiple-choice #confirmNo'
  element :job_title, '#jobTitle'
  element :job_title, '#jobTitle'

  section :service_message, 'div[class^="mtc-notification-banner"]' do
    element :service_message_heading, '#govuk-notification-banner-title'
    element :service_message_text, '.govuk-notification-banner__content'
  end

end
