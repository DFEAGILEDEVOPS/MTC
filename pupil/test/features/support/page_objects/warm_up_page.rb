class WarmUpPage < SitePrism::Page
  set_url '/warm-up/{url}'

  element :heading, '.heading-xlarge', text: "Warm-up questions"
  element :preload, '.preload'
  element :question, '.question'
  element :start_warm_up_questions, 'a[href="/warm-up/intro"]'
  element :welcome_message, '.lede', text: "Press 'Start now' to see 3 warm-up questions. Use them to familiarise yourself with what the questions will look like and how to enter your answers."
  element :start_now, 'a[href="/warm-up/question/1"]'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

  section :number_pad, NumberPadSection, '.numpad'

  def enter_answer_via_keyboard(answer)
    wait_for_question(2)
    answer_numbers = answer.to_s.scan(/\d/)
    answer_numbers.each do |number|
      number_pad.send(NumbersInWords.in_words(number.to_i)).click
    end
    number_pad.enter.click
  end

  def complete_warm_up_questions
    t1 = Time.now
    enter_answer_via_keyboard(7)
    enter_answer_via_keyboard(30)
    enter_answer_via_keyboard(12)
    t2 = Time.now
    t2 - t1
  end

end