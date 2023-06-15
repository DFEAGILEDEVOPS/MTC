class ManageHdfSubmissionPage < SitePrism::Page
  set_url '/service-manager/organisations/{id}/hdfstatus'

  element :dfe_number, '.govuk-summary-list__row:nth-of-type(1) dd'
  element :urn, '.govuk-summary-list__row:nth-of-type(2) dd'
  element :submission_date, '.govuk-summary-list__row:nth-of-type(3) dd'
  element :deleted, '.govuk-summary-list__row:nth-of-type(4) dd'
  element :delete_submission, 'button', text: 'Delete Submission'
  element :undo_deletion, 'button', text: 'Undo Deletion'

end
