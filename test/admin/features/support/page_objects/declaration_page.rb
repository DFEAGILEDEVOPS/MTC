class DeclarationPage < SitePrism::Page
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge', text: "Headteacher's declaration form"
  element :confirm_hdf, '.multiple-choice #confirm'
  element :decline_hdf, '.multiple-choice #decline'
  element :job_title, '#jobTitle'
  element :job_title, '#jobTitle'

end