class ViewFormPage < SitePrism::Page
  set_url '/test-developer/view{/check_id}'

  element :heading, '.govuk-heading-xl'
  element :information, '.information'
  element :back_to_manage_forms, 'a[href="/test-developer/assign-forms-to-check-windows"]'
  element :delete_form, 'a', text: 'Remove form'
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'

  elements :question_numbers, 'dd.inline-definition-list'
  elements :question_and_answers, 'dd.inline-definition-list'

  def question_and_answers_on_page
    question_and_answers.map {|q| q.text}
  end

  def question_and_answers_from_csv(path_to_csv)
    csv_values = CSV.read(path_to_csv)
    csv_values.map {|value| (value.join(',').gsub(',', ' × ') + (' = '))}.map {|value| value + (value.scan(/\d+/).first.to_i * value.scan(/\d+/).last.to_i).to_s}
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '#js-modal-cancel-button'
    element :confirm, '#js-modal-confirmation-button'
  end

end
