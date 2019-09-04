class HdfFormPage < SitePrism::Page
  set_url '/attendance/declaration-form'

  element :logo, '.logo-text'
  element :heading, '.govuk-heading-xl'
  element :first_name, 'input[name="firstName"]'
  element :last_name, 'input[name="lastName"]'
  element :is_headteacher_yes, 'input[name="isHeadteacher"][value="Y"]'
  element :is_headteacher_no, 'input[name="isHeadteacher"][value="N"]'
  element :job_title, 'input[name="jobTitle"]'
  element :continue, 'input[type="submit"]'
  element :breadcrumb, '#content .breadcrumbs'
  element :csrf, 'input[name="_csrf"]', visible: false
  elements :error_messages, '.error-message'
  section :error_summary, ErrorSummary, 'div[aria-labelledby="error-summary-title"]'

  def enter_details(hash)
    first_name.set hash.fetch(:first_name, '')
    last_name.set hash.fetch(:last_name, '')
    is_headteacher_yes.click if hash.fetch(:is_headteacher_yes, nil)
    is_headteacher_no.click if hash.fetch(:is_headteacher_no, nil)
    job_title.set hash.fetch(:job_title, '') if hash.fetch(:is_headteacher_no, nil)
  end
end
