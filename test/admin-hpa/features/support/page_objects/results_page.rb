class ResultsPage < SitePrism::Page
  set_url '/results/view-results'

  element :heading, '.heading-xlarge', text: 'Provisional results'
  element :results_heading, '#content h2', text: 'Individual pupil results'
  element :results_message, '.lede', text: 'Use this page to view individual pupil results. You can download the pupil results to see the breakdown of questions completed by each pupil.'
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :no_hdf_message, '#lead-paragraph', text: 'To view results you must complete the headteacher’s declaration form.'
  element :hdf_button, 'a[href="/attendance/declaration-form"]'


  section :results, ".spacious" do
    sections :header, "thead tr" do
      element :name, "th:nth-child(1)"
      element :score, "th:nth-child(2)"
      element :percentage, "th:nth-child(3)"
    end
    sections :pupil_list, "tbody tr" do
      element :name, "td:nth-child(1)"
      element :score, "td:nth-child(2)"
      element :percentage, "td:nth-child(3)"
    end
  end
end
