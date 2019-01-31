class DeclarationReviewPupilsPage < SitePrism::Page
    set_url '/attendance/review-pupil-details'
    element :heading, '.heading-xlarge', text: "Review pupil details"
    element :message, '.lede'
    element :pupils_table, "table[id='attendanceList']"
    element :continue_button, ".form-group a"

    section :pupil_list, '#attendanceList tbody' do
      sections :rows, 'tr' do
        element :name, '.highlight-wrapper'
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
