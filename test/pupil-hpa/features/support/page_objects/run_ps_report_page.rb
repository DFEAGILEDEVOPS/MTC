class RunPsReportPage < SitePrism::Page
  set_url '/tech-support/ps-report-run'

  element :checkbox, '#runReport'
  element :urns, '#urns'
  element :run, '#submit-runReport'

  def run_ps_report_for_school(urn)
    checkbox.click
    urns.set urn
    run.click
  end

end


