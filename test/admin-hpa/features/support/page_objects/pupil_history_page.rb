class PupilHistoryPage < SitePrism::Page
  set_url '/pupil-register/history/{id}'



  element :heading, 'h1.heading-xlarge', text: 'Pupil History'
  section :important_banner, '.govuk-notification-banner' do
    element :message, 'p.govuk-notification-banner__heading'
  end
  element :pupil_name, 'h2.govuk-heading-m'
  section :pupil_history, '.key-value-list' do
    element :dob, 'dd:nth-of-type(1)'
    element :upn, 'dd:nth-of-type(2)'
    element :gender, 'dd:nth-of-type(3)'
    element :complete, 'dd:nth-of-type(4)'
    element :not_taking_check, 'dd:nth-of-type(5)'
    element :restart_available, 'dd:nth-of-type(6)'
    element :number_of_restarts_taken, 'dd:nth-of-type(7)'
    element :discretionary_restart, 'dd:nth-of-type(8)'
  end
  section :check_history, '.govuk-spacious' do
    sections :rows, 'tbody tr' do
      element :pin_gen, 'td:nth-of-type(1)'
      element :login, 'td:nth-of-type(2)'
      element :recieved, 'td:nth-of-type(3)'
      element :active, 'td:nth-of-type(4)'
      element :type, 'td:nth-of-type(5)'
      element :status, 'td:nth-of-type(6)'
    end

  end
  element :discretionary_restart_button, '.govuk-button', text: 'Allow a discretionary restart'
  element :remove_discretionary_restart_button, '.govuk-button', text: 'Remove the discretionary restart'


end
