class DeclarationEditReasonPage < SitePrism::Page
    element :heading, '.heading-xlarge', text: "Edit reason for not taking the check"
    element :details, "details"
    element :attendance_codes, "ul.attendance-code-list"
    element :save_button, "button.button"
    element :cancel_button, "a.button-secondary"
end