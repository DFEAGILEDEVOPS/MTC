class FontSizePage < SitePrism::Page
  set_url '/font-choice'

  element :heading, '.aa-title-size', text: "Choose size of words and numbers"
  element :very_small, '#font-xsmall'
  element :small, '#font-small'
  element :regular, '#font-regular'
  element :large, '#font-large'
  element :very_large, '#font-xlarge'
  element :largest, '#font-xxlarge'


  section :very_small_preview, '.preview-box' do
    element :badge, '.badge', text: 'Size preview'
    element :question, '.question-text.aa-question-size-xsmall'
    elements :number_pad, '.numpad-button-preview-xsmall'
  end

  section :small_preview, '.preview-box' do
    element :badge, '.badge', text: 'Size preview'
    element :question, '.question-text.aa-question-size-small'
    elements :number_pad, '.numpad-button-preview-small'
  end

  section :regular_preview, '.preview-box' do
    element :badge, '.badge', text: 'Size preview'
    element :question, '.question-text.aa-question-size-regular'
    elements :number_pad, '.numpad-button-preview-regular'
  end

  section :large_preview, '.preview-box' do
    element :badge, '.badge', text: 'Size preview'
    element :question, '.question-text.aa-question-size-large'
    elements :number_pad, '.numpad-button-preview-large'
  end

  section :very_large_preview, '.preview-box' do
    element :badge, '.badge', text: 'Size preview'
    element :question, '.question-text.aa-question-size-xlarge'
    elements :number_pad, '.numpad-button-preview-xlarge'
  end

  section :largest_preview, '.preview-box' do
    element :badge, '.badge', text: 'Size preview'
    element :question, '.question-text.aa-question-size-xxlarge'
    elements :number_pad, '.numpad-button-preview-xxlarge'
  end

  element :setting_not_needed, '.grid-row p'
  element :logout, 'a[href="/sign-out"]'
  element :next, '.grid-row button', text: 'Next'


end
