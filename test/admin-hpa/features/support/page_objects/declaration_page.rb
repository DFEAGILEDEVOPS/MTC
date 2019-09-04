class DeclarationPage < SitePrism::Page
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.govuk-heading-xl', text: "Headteacher's declaration form"
  element :confirm_hdf, '.multiple-choice #confirmYes'
  element :decline_hdf, '.multiple-choice #confirmNo'
  element :job_title, '#jobTitle'
  element :job_title, '#jobTitle'

end
