class DeclarationReviewPupilsPage < SitePrism::Page
    set_url '/attendance/review-pupil-details'
    element :heading, '.heading-xlarge', text: "Review pupil details"
    element :message, '.lede'
    element :pupils_table, "[id='attendanceList']"
    element :continue_button, "input[value='Continue']"
end