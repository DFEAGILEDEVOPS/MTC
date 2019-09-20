class CheckSettingsPage < SitePrism::Page
  set_url '/service-manager/check-settings'

  element :question_time_limit, "#questionTimeLimit"
  element :loading_time_limit, "#loadingTimeLimit"
  element :check_time_limit, "#checkTimeLimit"
  element :save_changes, "input[value='Save']"
  element :cancel, "a", text: 'Cancel'
  element :error_message, '.govuk-error-message'
  element :error_summary_list, '.govuk-error-summary__list'
  element :error_summary, '.govuk-grid-column-two-thirds .govuk-error-summary__body p'
  element :successful_submission, '.govuk-info-message'
  element :csrf, 'input[name="_csrf"]', visible: false

  def update_question_time_limit(value)
    question_time_limit.set ''
    question_time_limit.set value
    save_changes.click
  end

  def update_loading_time_limit(value)
    loading_time_limit.set ''
    loading_time_limit.set value
    save_changes.click
  end

  def update_check_time_limit(value)
    check_time_limit.set ''
    check_time_limit.set value
    save_changes.click
  end
end
