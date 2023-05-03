class CompletePage < SitePrism::Page
  set_url '/check-complete'

  element :heading, '.aa-title-size', text: "Thank you"
  element :completion_text, 'p.lede', text: "Please leave feedback."
  element :sign_out, 'a[href="/sign-out"]'
  element :feedback, 'p > a[href="/feedback"]'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'
  element :start_again, 'a', text: 'start again'

  def wait_for_complete_page
    p 'waiting for Complete page to be displayed'
    p Time.now
    SafeTimeout.timeout(ENV['WAIT_TIME'].to_i){sleep 0.5 until has_heading?}
    p 'Complete page displayed'
  end

end
