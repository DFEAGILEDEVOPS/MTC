class ViewFormPage < SitePrism::Page
  set_url '/test-developer/view-form{/check_id}'

  element :heading, '#content h1'
  element :information, '.information'
  element :back_to_manage_forms, 'a[href="/test-developer/manage-check-forms"]'
  element :delete_form, 'input[value="Delete form"]'
  section :phase_banner, PhaseBanner, '.phase-banner'

  section :first_column, '.column-half:nth-of-type(1)' do
    elements :question_numbers, 'dd.inline-definition-list'
    elements :question_and_answers, 'dt.inline-definition-list'
  end

  section :second_column, '.column-half:nth-of-type(2)' do
    elements :question_numbers, 'dd.inline-definition-list'
    elements :question_and_answers, 'dt.inline-definition-list'
  end

  def question_and_answers_on_page
    first_column.question_and_answers.map{|q| q.text} + second_column.question_and_answers.map{|q| q.text}
  end

  def question_and_answers_from_csv(path_to_csv)
    csv_values = CSV.read(path_to_csv)
    csv_values.map{|value| (value.join(',').gsub(',', ' × ') + (' = '))}.map{|value| value + (value.scan(/\d+/).first.to_i * value.scan(/\d+/).last.to_i).to_s}
  end

end
