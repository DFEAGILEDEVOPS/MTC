class DeclarationEditReasonPage < SitePrism::Page
    element :heading, '.govuk-heading-xl', text: "Edit reason for not taking the check"
    element :details, "details"
    element :save_button, 'input[value="Save"]'
    element :cancel_button, "a.govuk-button"
    element :pupil_name, '.govuk-inset-text'
    element :select_reason_text, 'h3', 'Select reason'
    elements :attendance_codes, 'input[id^=attendance-code-]'
    element :save, 'button[type="submit"]'


    def attendance_code_mapping
      {'attendance-code-ABSNT' => 'Absent',
       'attendance-code-INCRG' => 'Incorrect registration',
       'attendance-code-LEFTT' => 'Left school',
       'attendance-code-NOACC' => 'Unable to access',
       'attendance-code-BLSTD' => 'Working below expectation',
       'attendance-code-JSTAR' => 'Just arrived with EAL'
      }
    end

    def select_reason(reason)
      mapping = attendance_code_mapping.find {|k, v| v == reason}
      attendance_codes.find {|code| code['id'] == mapping.first}.click
    end
end
