class AzureQueueHelper
  #
  # def self.get_messages(queue_name, number_of_messages_to_retrieve)
  #   AZURE_QUEUE_CLIENT.peek_messages(queue_name, { number_of_messages: number_of_messages_to_retrieve.to_i })
  # end
  #
  # def self.decode_message_text(message_text)
  #   JSON.parse Base64.decode64 message_text
  # end

  def self.create_check_submission_message(message_text)
    fail 'this needs a test util'
    AZURE_QUEUE_CLIENT.create_message('check-submitted', message_text, {encode: true})
  end

end
