class NumberPadSection < SitePrism::Section
  element :one, '.key[data-value="1"]'
  element :two, '.key[data-value="2"]'
  element :three, '.key[data-value="3"]'
  element :four, '.key[data-value="4"]'
  element :five, '.key[data-value="5"]'
  element :six, '.key[data-value="6"]'
  element :seven, '.key[data-value="7"]'
  element :eight, '.key[data-value="8"]'
  element :nine, '.key[data-value="9"]'
  element :zero, '.key[data-value="0"]'
  element :backspace, '.key[data-value="backspace"]'
  element :enter, '.enter-key[data-value="enter"]'
end