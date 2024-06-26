class EditSchoolPage < SitePrism::Page

  element :name, '#name'
  element :dfe, '#dfeNumber'
  element :urn, '#urn'
  element :lea_code, '#leaCode'
  element :estab_code, '#estabCode'
  element :type_of_establishment, "#typeOfEstablishmentCode"
  element :is_test_school, "#isTestSchool"
  element :update, '.govuk-button', text: 'Update organisation'
  element :discard, '.govuk-button', text: 'Discard edits and view organisation'

  def edit_details(hash)
    name.set hash.fetch(:name, name.value)
    dfe.set hash.fetch(:dfe, dfe.value)
    urn.set hash.fetch(:urn, urn.value)
    lea_code.set hash.fetch(:lea_code, lea_code.value)
    estab_code.set hash.fetch(:estab_code, estab_code.value)
    type_of_establishment.select hash.fetch(:type_of_establishment, nil)
  end

end
