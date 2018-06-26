class CompletePage < SitePrism::Page
  set_url '/check-complete'

  element :heading, '.heading-xlarge', text: "Thank you"
  element :completion_text, 'p.text', text: "You have completed the multiplication tables check."
  element :sign_out, 'a[href="/sign-out"]'
  element :feedback, 'p > a[href="/feedback"]'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'


  def wait_for_complete_page
    i = 0
    while i < 20
      if(has_completion_text?)
        puts "Complete Page is visible."
        break
      else
        puts "waiting for Complete Page to be visible. Visibility status is: #{has_completion_text?}"
        sleep 0.5
        i = i + 1
      end
    end
  end

end
