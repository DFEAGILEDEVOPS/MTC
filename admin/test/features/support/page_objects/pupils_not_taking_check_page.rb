class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/school/pupils-not-taking-check'

  element :heading, '.heading-xlarge', text: 'Pupils not taking the check'
  element :info_text, 'p.lede', text: "Click on the button below to add reasons for pupils who are not taking the check"
  element :add_reason, 'a', text: "Add reason for pupil"
  element :back_to_top, 'a', text: "Back to top"
  element :generate_pins, 'a', text: "Generate PINs"

end
