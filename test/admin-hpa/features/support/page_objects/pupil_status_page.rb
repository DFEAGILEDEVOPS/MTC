class PupilStatusPage < SitePrism::Page
  set_url '/pupil-status'

  element :heading, '.heading-xlarge', text: 'See how many pupils have completed the official check'
  element :info, '.govuk-body', text: 'Review the status of the pupils to ensure the pupils have all successfully completed the check before you sign the HDF'
  element :warning_message, '.govuk-warning-message'

  element :nav_title, '.app-step-nav-related__pretitle', text: 'What does each status mean?'

  section :status_meanings, '#step-by-step-navigation' do
    element :show_all, 'button', text: 'Show all'

    section :checks_that_require_action, '#check-require-action' do
      element :header, '.app-step-nav__header'
      elements :info_text, 'p'
    end

    section :pupils_not_started, '#pupils-not-started-check' do
      element :header, '.app-step-nav__header'
      elements :info_text, 'p'
    end

    section :pupils_in_progress, '#pupils-in-progress' do
      element :header, '.app-step-nav__header'
    end

    section :pupils_completed, '#completed-checks' do
      element :header, '.app-step-nav__header'
    end
  end

  section :checks_that_require_action, '#red-card' do
    element :title, '.custom-card-small-text', text: 'Checks that require action'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :pupils_not_started, '#orange-card' do
    element :title, '.custom-card-small-text', text: 'Pupils not started'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :pupils_in_progress, '#blue-card' do
    element :title, '.custom-card-small-text', text: 'Pupils in progress'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :pupils_completed, '#green-card' do
    element :title, '.custom-card-small-text', text: 'Pupils completed'
    element :count, '.custom-card-large-text'
    element :total, '.custom-card-small-text:last-of-type'
  end

  section :checks_that_require_action_details, '#red-card-details' do
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

  section :pupils_not_started_details, '#orange-card-details' do
    element :window_info, 'p.govuk-body'
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
      end
    end
  end

  section :pupils_in_progress_details, '#blue-card-details' do
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
        element :steps, '.govuk-details__summary-text', text: 'Steps to take'
      end
    end
  end

  section :pupils_completed_details, '#green-card-details' do
    element :window_info, 'p.govuk-body'
    section :pupil_list, '#pupil-status' do
      element :table_caption, '.govuk-table__caption'
      sections :pupil_row, 'tbody tr' do
        element :names, 'td:nth-child(1)'
        element :status, 'td:nth-child(2)'
      end
    end
  end

  section :service_message, 'div[class^="mtc-notification-banner"]' do
    element :service_message_heading, '#govuk-notification-banner-title'
    element :service_message_text, '.govuk-notification-banner__content'
  end

  def find_status_for_pupil(status, name)
    case status
    when 'Logged in'
      Timeout.timeout(20) { pupils_in_progress.count.click until pupils_in_progress_details.pupil_list.visible? }
      pupils_in_progress_details.pupil_list.pupil_row.find { |r| r.text.include? name }
    when 'Not started'
      Timeout.timeout(20) { pupils_not_started.count.click until pupils_not_started_details.pupil_list.visible? }
      pupils_not_started_details.pupil_list.pupil_row.find { |r| r.text.include? name }
    when 'Complete'
      Timeout.timeout(20) { pupils_completed.count.click until pupils_completed_details.pupil_list.visible? }
      pupils_completed_details.pupil_list.pupil_row.find { |r| r.text.include? name }
    when 'Restart'
      Timeout.timeout(20) { pupils_not_started.count.click until pupils_not_started_details.pupil_list.visible? }
      pupils_not_started_details.pupil_list.pupil_row.find { |r| r.text.include? name }
    when "Pupil check not received", "Error in processing", 'Overdue - logged in but check not started'
      Timeout.timeout(20) { checks_that_require_action.count.click until checks_that_require_action_details.pupil_list.visible? }
      checks_that_require_action_details.pupil_list.pupil_row.find { |r| r.text.include? name }
    else
      fail "Status - #{status} not found"
    end
  end

end
