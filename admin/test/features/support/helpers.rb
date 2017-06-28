module Helpers

  def wait_until(&block)
    WaitUtil.wait_for_condition("waiting for condition", :timeout_sec => 5, :delay_sec => 0.5) do
      block.call
    end
  end

end
