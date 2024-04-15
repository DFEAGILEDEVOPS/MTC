class RunPsReportPage < SitePrism::Page
  set_url '/tech-support/ps-report-run'

  element :checkbox, '#runReport'
  element :run, '#submit-runReport'

  def run_ps_report
    checkbox.click
    run.click
  end

end


