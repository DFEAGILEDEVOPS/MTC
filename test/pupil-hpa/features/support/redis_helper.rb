class RedisHelper

  def self.wait_for_prepared_check(school_password,pin)
    p school_password, pin
    found = false
    begin
      retries ||= 0
      sleep 5
      p 'waiting for prepared check'
      p "preparedCheck:#{school_password}:#{pin}"
      result = REDIS_CLIENT.get("preparedCheck:#{school_password}:#{pin}")
      if (result.nil?)
        fail "Pin not found in redis"
      end
    rescue
      retry if (retries += 1) < 60
    end
  end

end
