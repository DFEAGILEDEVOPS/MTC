class DeclarationReviewPupilsPage < SitePrism::Page
    set_url '/attendance/review-pupil-details'
    element :heading, '.govuk-heading-xl', text: "Review pupil details"
    element :message, '#lead-paragraph  '
    element :pupils_table, "#attendanceList"
    element :continue_button, 'a[href="/attendance/confirm-and-submit"]'

    section :pupil_list, '#attendanceList tbody' do
      sections :rows, 'tr' do
        element :name, '.govuk-highlight-wrapper'
        element :reason, 'td:nth-of-type(2)'
        element :link, 'a'
      end
    end


    def select_pupil(name)
      row = pupil_list.rows.find {|row| row.name.text.include? name}
      row.link.click
    end

    def get_pupil_reason(name)
      row = pupil_list.rows.find {|row| row.name.text.include? name}
      row.reason.text
    end

end
