class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/school/pupils-not-taking-check'

  element :heading, '.heading-xlarge', text: 'Pupils not taking the check'
  element :info_text, 'p.lede', text: "Click on the button below to add reasons for pupils who are not taking the check"
  element :add_reason, 'a', text: "Add reason for pupil"
  element :back_to_top, 'a', text: "Back to top"
  element :generate_pins, 'a', text: "Generate PINs"

  section :explanation_section, 'details' do
    element :toggle, 'summary[role="button"]'
    element :absent, 'strong', text: 'Absent'
    element :absent_explanation, 'div', text: 'Pupil has not taken the check due to absence'
    element :left_school, 'strong', text: 'Left school'
    element :left_school_explanation, 'div', text: 'Pupil has left the school'
    element :incorrect_reg, 'strong', text: 'Incorrect registration'
    element :incorrect_reg_explanation, 'div', text: 'Pupil has been incorrectly added to the Pupil Register. They may have been added by the school, or incorrectly included in the pre-populated list'
    element :withdrawn, 'strong', text: 'Withdrawn'
    element :withdrawn_explanation, 'div', text: 'Pupil has been withdrawn from the check.'
    element :withdrawn_explanation_bullet, 'div', text: 'This includes pupils who:'
    element :withdrawn_explanation_bullet_one, 'li', text: 'have just arrived and you have not had time to assess their abilities'
    element :withdrawn_explanation_bullet_two, 'li', text: 'have no understanding of multiplication tables'
    element :withdrawn_explanation_bullet_three, 'li', text: 'are unable to access the check'
  end

end
