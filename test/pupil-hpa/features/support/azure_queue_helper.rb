class AzureQueueHelper

  def self.get_messages(queue_name, number_of_messages_to_retrieve)
    AZURE_QUEUE_CLIENT.peek_messages(queue_name, { number_of_messages: number_of_messages_to_retrieve.to_i })
  end

  def self.decode_message_text(message_text)
    JSON.parse Base64.decode64 message_text
  end

end
