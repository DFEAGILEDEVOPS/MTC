class ColourContrastPage < SitePrism::Page
  set_url '/colour-choice'

  element :heading, '.aa-lead-size', text: 'Choose colour of page'
  element :black_on_white_contrast, '#contrast-bow'
  element :yellow_on_black_contrast, '#contrast-yob'
  element :black_on_blue_contrast, '#contrast-bob'
  element :black_on_peach_contrast, '#contrast-bop'
  element :black_on_cream_contrast, '#contrast-boc'

  section :black_on_white_preview, '.preview-box.aa-contrast-bow' do
    element :badge, '.badge', text: 'Colour preview'
    element :question, '.question-text'
    elements :number_pad, 'td button'
  end

  section :yellow_on_black_preview, '.preview-box.aa-contrast-yob' do
    element :badge, '.badge', text: 'Colour preview'
    element :question, '.question-text'
    elements :number_pad, 'td button'
  end

  section :black_on_blue_preview, '.preview-box.aa-contrast-bob' do
    element :badge, '.badge', text: 'Colour preview'
    element :question, '.question-text'
    elements :number_pad, 'td button'
  end

  section :black_on_peach_preview, '.preview-box.aa-contrast-bop' do
    element :badge, '.badge', text: 'Colour preview'
    element :question, '.question-text'
    elements :number_pad, 'td button'
  end

  section :black_on_cream_preview, '.preview-box.aa-contrast-boc' do
    element :badge, '.badge', text: 'Colour preview'
    element :question, '.question-text'
    elements :number_pad, 'td button'
  end

  element :setting_not_needed, '.grid-row p'
  element :logout, 'a[href="/sign-out"]'
  element :next, '.grid-row button', text: 'Next'

end