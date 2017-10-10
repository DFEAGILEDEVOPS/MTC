module Helpers

  def wait_until(timeout_sec=5,delay_sec=0.5, &block)
    WaitUtil.wait_for_condition("waiting for condition", :timeout_sec => timeout_sec, :delay_sec => delay_sec) do
      block.call
    end
  end

  def create_question_strings(questions)
    array_of_question_strings = []
    questions.each do |question|
      array_of_question_strings << question['factor1'].to_s + ' × ' + question['factor2'].to_s + ' ='
    end
    array_of_question_strings
  end

end
