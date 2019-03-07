class ReasonSection < SitePrism::Section

  element :text, '.form-label div', text: "The expected age range of pupils taking the check is 8 to 9 years old. Please provide a reason why this pupil's age is outside of this range."
  element :text_area, "#ageReason"

end
