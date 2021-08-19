class EditSchoolPage < SitePrism::Page

  element :name, '#name'
  element :dfe, '#dfeNumber'
  element :urn, '#urn'
  element :lea_code, '#leaCode'
  element :estab_code, '#estabCode'
  element :update, '.govuk-button', text: 'Update organisation'
  element :discard, '.govuk-button', text: 'Discard edits and view organisation'

  def edit_details(hash)
    name.set hash.fetch(:name, nil)
    dfe.set hash.fetch(:dfe, nil)
    urn.set hash.fetch(:urn, nil)
    lea_code.set hash.fetch(:lea_code, nil)
    estab_code.set hash.fetch(:estab_code, nil)
  end

end
