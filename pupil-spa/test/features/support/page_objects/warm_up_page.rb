class WarmUpPage < SitePrism::Page
  set_url '/check'

  element :heading, '.heading-xlarge', text: "Practice questions"
  element :preload, '.preload'
  element :timer,'.remaining-time-warmup'
  element :question, '.question'
  element :start_warm_up_questions, '#start-now-button'
  element :welcome_message, '.lede', text: "Now there will be 3 practice questions"
  element :start_now, '#start-now-button'
  element :warm_up_label, '.warm-up-questions-label'

  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

  section :number_pad, NumberPadSection, '.numpad'

  def wait_for_preload_to_expire(time=3)
    wait_until(time + 0.5, 0.1) {preload.visible?}
    wait_until(time + 0.5, 0.1) {has_no_preload?}
  end

  def wait_for_question_timer_to_expire(time=3)
    wait_until(time + 0.5, 0.1) {question.visible?}
    wait_until(time + 0.5, 0.1) {has_no_question?}
  end

  def wait_for_question(time=4)
    wait_until(time + 0.5, 0.1) {has_question?}
  end

  def answer_question_via(input_type, answer)
    if input_type == 'numpad'
      enter_answer_via_numpad(answer)
    else
      enter_answer_via_keyboard(answer)
    end
  end

  def enter_answer_via_numpad(answer)
    answer_numbers = answer.to_s.scan(/\d/)
    answer_numbers.each do |number|
      wait_for_number_pad
      number_pad.send(NumbersInWords.in_words(number.to_i)).click
    end
  end

  def enter_answer_via_keyboard(answer)
    answer_numbers = answer.to_s.scan(/\d/)
    answer_numbers.each do |number|
      wait_for_number_pad
      number_pad.one.send_keys("numpad#{number}".to_sym)
    end
  end

  def complete_check_with_correct_answers(number_of_questions, input_type)
    @array_of_answers = []
    number_of_questions.to_i.times do
      wait_for_preload
      wait_for_question(2)
      wait_until {check_page.question.visible?}
      @question = check_page.question.text
      values = @question.gsub('=', '').split('×').map {|n| n.strip}
      answer = values.first.to_i * values.last.to_i
      @array_of_answers << answer
      answer_question_via(input_type, answer)
      number_pad.enter.click if input_type == 'numpad'
      number_pad.one.send_keys(:enter) if input_type == 'keyboard'
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
      enter_answer_via_numpad(answer)
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
      enter_answer_via_numpad(answer)
      @array_of_answers << @zeros.join + answer.to_s
      number_pad.enter.click
    end
    @array_of_answers
  end


  def complete_question(answer, input_type)
    array_of_answers = []
    wait_for_preload
    wait_for_question(2)
    array_of_answers << answer
    answer_question_via(input_type, answer)
    number_pad.enter.click if input_type == 'numpad'
    number_pad.one.send_keys(:enter) if input_type == 'keyboard'
    array_of_answers
  end

  def array_of_inputs_from_numpad(array_of_answers)
    @inputs_array = []
    @question_inputs = []
    array_of_answers.each do |answer|
      @ans = []
      answer.to_s.chars.map(&:to_i).each do |char|
        @ans << {"input" => "left click", "eventType" => "mousedown"}
        @ans << {"input" => char.to_s, "eventType" => "click"}
      end
      @ans << {"input" => "left click", "eventType" => "mousedown"}
      @ans << {"input" => "enter", "eventType" => "click"}
      @inputs_array << @ans
    end
    @inputs_array
  end

  def array_of_inputs_from_keyboard(array_of_answers)
    @inputs_array = []
    @question_inputs = []
    array_of_answers.each do |answer|
      @ans = []
      answer.to_s.chars.map(&:to_i).each do |char|
        @ans << {"input" => char.to_s, "eventType" => "keydown"}
      end
      @ans << {"input" => "Enter", "eventType" => "keydown"}
      @ans << {"input" => "enter", "eventType" => "click"}
      @inputs_array << @ans
    end
    @inputs_array
  end
end
