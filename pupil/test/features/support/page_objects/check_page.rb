class CheckPage < SitePrism::Page
  set_url '/check/question/{number}{?query*}'

  element :preload, '.preload'
  # element :timer, '.remaining-time'
  element :question, '.question'
  element :answer, '#js-answer'

  section :number_pad, NumberPadSection, '.numpad'


  def wait_for_preload
    wait_until(3, 0.1) {preload.visible?}
    wait_until(3, 0.1) {!preload.visible?}
  end

  def wait_for_timer(seconds)
    sleep seconds.to_i + 2
  end

  def enter_answer_via_keyboard(answer)
    answer_numbers = answer.to_s.scan(/\d/)
    answer_numbers.each do |number|
      wait_for_number_pad
      number_pad.send(NumbersInWords.in_words(number.to_i)).click
    end
  end

  def complete_check_with_correct_answers(number_of_questions)
    @array_of_answers = []
    number_of_questions.to_i.times do
      wait_for_preload
      wait_for_question(2)
      wait_until{check_page.question.visible?}
      @question = check_page.question.text
      values = @question.gsub('=', '').split('×').map {|n| n.strip}
      answer = values.first.to_i * values.last.to_i
      @array_of_answers << answer
      enter_answer_via_keyboard(answer)
      number_pad.enter.click
    end
    @array_of_answers
  end

  def complete_check_with_wrong_answers(number_of_questions)
    @array_of_answers = []
    number_of_questions.to_i.times do
      wait_for_preload
      wait_for_question(2)
      @question = check_page.question.text
      values = @question.gsub('=', '').split('×').map {|n| n.strip}
      answer = (values.first.to_i * values.last.to_i + 5)
      @array_of_answers << answer
      enter_answer_via_keyboard(answer)
      number_pad.enter.click
    end
    @array_of_answers
  end

  def calculate_leading_zeros(answer)
    5 - answer.to_s.size
  end

  def complete_check_with_leading_zeros
    @array_of_answers = []
    10.times do
      wait_for_preload
      wait_for_question(2)
      @question = check_page.question.text
      values = @question.gsub('=', '').split('×').map {|n| n.strip}
      answer = values.first.to_i * values.last.to_i
      number_of_zeros = calculate_leading_zeros(answer)
      @zeros = []
      number_of_zeros.times do
        number_pad.zero.click
        @zeros << '0'
      end
      enter_answer_via_keyboard(answer)
      @array_of_answers << @zeros.join + answer.to_s
      number_pad.enter.click
    end
    @array_of_answers
  end


end
