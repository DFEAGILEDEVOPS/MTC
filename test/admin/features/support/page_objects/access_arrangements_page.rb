class AccessArrangementsPage < SitePrism::Page
  set_url '/access-arrangements/overview'

  element :heading, '.heading-xlarge', text: 'Access arrangements'
  element :information, '.lede', text: 'Modify multiplication tables check for pupils with specific needs. Modifications should be previewed in the pupil’s familiarisation check.'
  element :select_pupil_and_arrangement_btn, 'input[value="Select pupil and arrangement"]'

end