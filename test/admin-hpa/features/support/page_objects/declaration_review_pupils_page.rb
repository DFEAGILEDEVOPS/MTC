class DeclarationReviewPupilsPage < SitePrism::Page
    set_url '/attendance/review-pupil-details'
    element :heading, '.heading-xlarge', text: "Review pupil details"
    element :message, '.lede'
    element :pupils_table, "table[id='attendanceList']"
    element :continue_button, "input[value='Continue']"

    def edit_user
        pupils_table.first("tbody > tr > td > a").click
    end
end