class LoadingPage < SitePrism::Page

  include RSpec::Matchers

  set_url '/check'

  element :idle_modal, '.modal-box'
  element :next_button, '#goButton'

  def wait_for_idle_to_expire(time)
    sleep(time + 0.5)
  end

end
  