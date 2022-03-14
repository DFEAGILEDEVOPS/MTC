class ViewJobsPage < SitePrism::Page
  set_url '/service-manager/jobs'

  element :heading, '.govuk-heading-xl'
  element :message, '.govuk-info-message'

  section :job_history, '#school-audit' do
    sections :rows, 'tbody tr' do
      element :created_at, 'td:nth-child(1)'
      element :type, 'td:nth-child(2)'
      element :status, 'td:nth-child(3)'
      element :outputs, '.govuk-link'
    end
  end


end
