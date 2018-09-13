class IctFeedbackPage < SitePrism::Page
  set_url '/ict-survey/feedback'

  element :heading, '.heading-xlarge', text: "Give feedback"
  element :problem_text, '.heading-large', text: "Did you encounter any problems running the connection test on your ICT?"
  element :text_area, "textarea.textarea"
  element :optional_heading, '.heading-large', text: "Optional follow-up"
  element :optional_text, 'p.lede', text: "If you encountered a problem and are willing to participate in further research, please provide us with your contact details. Please note, we may not be able to include all schools in the research."

  element :first_name, '#first-name'
  element :last_name, '#last-name'
  element :contact_number, '#contact-number'
  element :email, '#email-address'
  element :school_name, '#school-name'
  element :submit_feedback, '.button'

  section :error_summary, 'div.error-summary' do
    element :error_heading, 'h2', text: 'You need to fix the errors on this page before continuing.'
    element :error_text, 'p', text: 'See highlighted errors below'
    elements :error_messages, '.error-summary-list p'
  end

  def enter_complete_feedback
    text_area.set 'This is my feedback on the ICT survey'
    enter_contact_details
  end

  def enter_contact_details
    first_name.set 'Automated'
    last_name.set 'Tester'
    contact_number.set '01582 999999'
    email.set 'at@hotmail.com'
    school_name.set 'Testing academy'
  end
end
