class CheckSettingsPage < SitePrism::Page
  set_url '/service-manager/check-settings'

  element :question_time_limit, "#questionTimeLimit"
  element :loading_time_limit, "#loadingTimeLimit"
  element :save_changes, "input[value='Save changes']"
  element :error_message, '.error-message'
  element :error_summary_list, '.error-summary-list'
  element :error_summary, '.error-summary p'
  element :successful_submission, '.box-successful h2'

  def update_question_time_limit(value)
    sleep 1
    p has_question_time_limit
    question_time_limit.set ''
    question_time_limit.set value
    save_changes.click
  end

  def update_loading_time_limit(value)
    sleep 1
    p has_loading_time_limit?
    loading_time_limit.set ''
    loading_time_limit.set value
    save_changes.click
  end
end
