class ViewFormPage < SitePrism::Page
  set_url '/test-developer/view-form{/check_id}'

  element :heading, '.heading-xlarge'
  element :information, '.information'
  element :back_to_manage_forms, 'a[href="/test-developer/upload-and-view-forms"]'
  element :delete_form, 'a', text: 'Remove form'
  section :phase_banner, PhaseBanner, '.phase-banner'

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
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'
  end

end
