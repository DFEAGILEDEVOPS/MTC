module Helpers

  def wait_until(&block)
    WaitUtil.wait_for_condition("waiting for condition", :timeout_sec => 5, :delay_sec => 0.5) do
      block.call
    end
  end

  def time_to_nearest_hour(time)
    time - time.sec - 60 * time.min
    return time.strftime("%Y-%m-%d %H")
  end
end
