class ResultsPage < SitePrism::Page

  element :heading, '.heading-xlarge', text: 'Results'
  element :results_heading, '#content h2', text: 'Individual pupil results'
  element :results_message, '.lede', text: 'Use this page to view individual pupil results. You can download the pupil results to see the breakdown of questions completed by each pupil.'
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :download_csv,"a[href='/school/download-results']"


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