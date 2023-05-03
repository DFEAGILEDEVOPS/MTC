class PupilStatusPage < SitePrism::Page
  set_url '/pupil-status'

  element :heading, '.heading-xlarge', text: 'See how many pupils have completed the official check'
  element :info, '.govuk-body', text: 'Review the status of the pupils to ensure the pupils have all successfully completed the check before you sign the HDF'
  element :warning_message, '.govuk-warning-message'

  section :related, '.app-related-items' do
    # element :heading, '.govuk-heading-m', text: 'Related'
    # element :guidance, '.govuk-link', text: 'Guidance'
    # element :group_pupils, '.govuk-link', text: 'Group pupils'
    # element :pupils_not_taking_check, '.govuk-link', text: 'Pupils not taking the check'
    # element :access_arrangements, '.govuk-link', text: 'Access arrangements'
    element :nav_title, '.app-step-nav-related__pretitle', text: 'What does each status mean?'

    section :status_meanings, '#step-by-step-navigation' do
      element :show_all, 'button', text: 'Show all'

      section :checks_with_errors, '#check-with-errors' do
        element :header, '.app-step-nav__header'
        elements :info_text, 'p'
      end
      section :not_started_checks, '#pupils-not-started-check' do
        element :header, '.app-step-nav__header'
        elements :info_text, 'p'
      end
      section :not_taking_checks, '#pupils-not-taking-check' do
        element :header, '.app-step-nav__header'
        element :info_text, 'p', text: 'This is the official Multiplication tables check. Please generate passwords and PINs and hand them to pupils to use for the Official check.'
      end
      section :completed_checks, '#completed-checks' do
        element :header, '.app-step-nav__header'
        element :info_text, 'p', text: 'Go through the pupil status to ensure all pupils have successfully taken the check or have a reason for removing pupil from the MTC register'
      end
    end
  end

  section :checks_with_errors, '#red-card' do
    element :title, '.custom-card-small-text', text: 'Check with errors'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :not_started_checks, '#orange-card' do
    element :title, '.custom-card-small-text', text: 'Pupils that have not started yet'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :not_taking_checks, '#blue-card' do
    element :title, '.custom-card-small-text', text: 'Pupils not taking the check'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :completed_checks, '#green-card' do
    element :title, '.custom-card-small-text', text: 'Completed checks'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :checks_with_errors_details, '#red-card-details' do
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
        element :steps, '.govuk-details__summary-text', text: 'Steps to take'
        element :steps_text, '.govuk-details__text'
        element :steps_link, '.govuk-link'
      end
    end
  end

  section :not_started_checks_details, '#orange-card-details' do
    element :window_info, 'p.govuk-body'
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
      end
    end
  end

  section :not_taking_checks_details, '#blue-card-details' do
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
        element :steps, '.govuk-details__summary-text', text: 'Steps to take'
        element :steps_text, '.govuk-details__text'
        element :steps_link, '.govuk-link'
      end
    end
  end

  section :completed_checks_details, '#green-card-details' do
    element :window_info, 'p.govuk-body'
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
      end
    end
  end


  def find_status_for_pupil(status, name)
    case status
    when 'Not started'
      SafeTimeout.timeout(20) {not_started_checks.count.click until not_started_checks_details.pupil_list.visible?}
      not_started_checks_details.pupil_list.pupil_row.find {|r| r.text.include? name}
    when 'Complete'
      SafeTimeout.timeout(20) {completed_checks.count.click until completed_checks_details.pupil_list.visible?}
      completed_checks_details.pupil_list.pupil_row.find {|r| r.text.include? name}
    when 'Restart'
      SafeTimeout.timeout(20) {not_started_checks.count.click until not_started_checks_details.pupil_list.visible?}
      not_started_checks_details.pupil_list.pupil_row.find {|r| r.text.include? name}
    when "Pupil check not received", "Error in processing"
      SafeTimeout.timeout(20) {checks_with_errors.count.click until checks_with_errors_details.pupil_list.visible?}
      checks_with_errors_details.pupil_list.pupil_row.find {|r| r.text.include? name}
    else
      fail "Status - #{status} not found"
    end
  end

end
