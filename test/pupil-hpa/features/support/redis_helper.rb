class RedisHelper

  def self.wait_for_prepared_check(school_password,pin)
    p school_password, pin
    found = false
    begin
      retries ||= 0
      sleep 5
      result = REDIS_CLIENT.get("preparedCheck:#{school_password}:#{pin}")
      p result
      if (result.nil?)
        fail "Pin not found in redis"
      end
    rescue
      retry if (retries += 1) < 120
    end
  end

end
