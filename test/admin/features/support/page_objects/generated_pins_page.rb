class GeneratedPinsPage < SitePrism::Page
  set_url 'pupil-pin/view-and-print-live-pins'


  element :generate_more_pin_btn, 'a', text: "Generate additional PINs"
  element :csrf, 'input[name="_csrf"]', visible: false

  element :heading, '.heading-xlarge'
  element :generate_pin_message, '.lede', text: 'Personal Identification Number (PIN) have been generated for selected pupils. These expire at 4pm daily.'
  element :print_pins_btn, "a", text: 'Print PINs'

  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :name, 'label strong'
      element :school_pwd_label, '.pin-content span:nth-child(1)'
      element :school_password, '.pin-content span:nth-child(2)'
      element :pin_label, '.pin-content span:nth-child(4)'
      element :pin, '.pin-content span:nth-child(5)'
    end
  end

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end