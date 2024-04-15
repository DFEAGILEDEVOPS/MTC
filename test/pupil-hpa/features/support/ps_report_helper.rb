class PsReportHelper

  def self.store_pupil(pupil_details,school_id,filename='ps_report_data_set_1.csv',description=nil)
    CSV.open("data/#{filename}", "ab") do |csv|
      csv << [description, pupil_details[:upn],school_id]
    end
  end


end
