class ManageAttendanceCodesPage < SitePrism::Page
  set_url '/service-manager/attendance-codes'

  element :absent, "#ABSNT"
  element :incorrect_registration, "#INCRG"
  element :just_arrived, "#JSTAR"
  element :left_school, "#LEFTT"
  element :unable_to_access, "#NOACC"
  element :below_expectation, "#BLSTD"

  element :save_changes, '.govuk-button', text: 'Save changes'

  def disable_attendance_code(reason)
    case reason
    when 'Absent during check window'
      absent.click
    when 'Incorrect registration'
      incorrect_registration.click
    when 'Left school'
      left_school.click
    when 'Unable to access'
      unable_to_access.click
    when 'Working below expectation'
      below_expectation.click
    when 'Just arrived and unable to establish abilities'
      just_arrived.click
    else
      fail "#{reason} - not recognised"
    end
  end

  def enable_all_attendance_codes
    absent.click unless absent.checked?
    incorrect_registration.click unless incorrect_registration.checked?
    just_arrived.click unless just_arrived.checked?
    left_school.click unless left_school.checked?
    unable_to_access.click unless unable_to_access.checked?
    below_expectation.click unless below_expectation.checked?
    save_changes.click
  end
end
