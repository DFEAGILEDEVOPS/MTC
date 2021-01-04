class CompletePage < SitePrism::Page
  set_url '/check-complete'

  element :heading, '.aa-title-size', text: "Thank you"
  element :completion_text, 'p.lede', text: "Please leave feedback."
  element :sign_out, 'a[href="/sign-out"]'
  element :feedback, 'p > a[href="/feedback"]'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'
  element :start_again, 'a', text: 'start again'

  def wait_for_complete_page
    i = 0
    while i < 60
      if(has_heading?)
        puts "Complete Page is visible."
        break
      else
        puts "waiting for Complete Page to be visible. Visibility status is: #{has_heading?}"
        sleep 5
        i = i + 1
      end
    end
  end

end
