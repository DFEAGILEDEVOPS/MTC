class AttendancePage < SitePrism::Page

  element :heading, '.heading-xlarge', text: 'Attendance register'
  element :message, '.lede', text: "Use this page to confirm pupil attendance. Select the checkboxes next to the names of the pupils that took the check and submit. You will be able to sign the headteacher's declaration once submitted."
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :submit,"[type='submit']"

  section :attendance_list, "#attendanceList" do
    element :tick_all, '#tickAllCheckboxes'
    sections :header, "thead tr" do
      element :name, "th label"
      element :score, "th:nth-child(3) "
    end
    sections :pupil_list, "tbody tr" do
      element :name, "td:nth-child(1) label"
      element :checkbox,"td:nth-child(1) [type='checkbox']"
      element :score, "td:nth-child(2)"
    end
  end


end