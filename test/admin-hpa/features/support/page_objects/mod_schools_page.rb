class ModSchoolsPage < SitePrism::Page
  set_url '/mod-settings'

  element :heading, '.govuk-heading-xl'
  element :info_text, '#lead-paragraph'
  element :update_to_mod_school_button, 'a[href="/service-manager/mod-settings/add-school"]'
  element :disabled_save, 'button[disabled="disabled"]'
  element :save, '.govuk-button[type="submit"]'
  element :cancel, 'a[href="/service-manager/mod-settings/cancel"]'
  element :flash_message, '.govuk-info-message'
  element :confirm_removal, '#js-modal-confirmation-button'
  element :cancel_removal, '#js-modal-cancel-button'
  section :school_list, '#sce-schools' do
    sections :rows, 'tbody tr' do
      element :school_name, '.allow-wrap'
      element :highlighted, '.govuk-highlight-item'
      element :urn, '.govuk-font-greyed-out'
      element :country, '#timezone'
      element :country_auto_complete, '#timezone__listbox li'
      element :remove_school, '#js-modal-link'
    end
  end

  def find_school_row(school_record)
    school_list.rows.find {|row| row.school_name.text.include? "#{school_record['name']}\nURN: #{school_record['urn']}"}
  end

  def remove_school(school_record)
    school_row = find_school_row(school_record)
    school_row.remove_school.click
    confirm_removal.click
  end

end
