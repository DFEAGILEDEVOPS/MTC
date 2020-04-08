class SchoolSummaryPage < SitePrism::Page
  set_url '/helpdesk/school-summary'

  element :heading, '.govuk-heading-xl'

  section :check_summary, '#checkSummary' do
    element :caption, '.govuk-body', text: 'Pupil Register Summary'
    sections :rows, 'tr' do
      element :total, 'td:nth-of-type(1)'
      element :completed, 'td:nth-of-type(2)'
      element :not_taking, 'td:nth-of-type(3)'
    end
  end

  section :pupil_register_summary, '#registerSummary' do
    element :caption, '.govuk-body', text: 'Pupil Register Summary'
    sections :rows, 'tbody tr' do
      element :total, 'td:nth-of-type(1)'
      element :completed, 'td:nth-of-type(2)'
      element :not_taking, 'td:nth-of-type(3)'
    end
  end

  section :live_checks, '#liveSummary' do
    element :caption, '.govuk-body', text: 'Live Checks'
    sections :rows, 'tbody tr' do
      element :date, 'td:nth-of-type(1)'
      element :pins_generated, 'td:nth-of-type(2)'
      element :users_logged_in, 'td:nth-of-type(3)'
    end
  end

  section :tio_checks, '#tioSummary' do
    element :caption, '.govuk-body', text: 'Try-it-Out Checks'
    sections :rows, 'tbody tr' do
      element :date, 'td:nth-of-type(1)'
      element :pins_generated, 'td:nth-of-type(2)'
    end
  end



end
