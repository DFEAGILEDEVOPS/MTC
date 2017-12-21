class SqlDbHelper

  def self.pupil_details(upn)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}'"
    result = SQL_CLIENT.execute(sql)
    result.first
  end

  def self.pupil_details_using_names(firstname, lastname)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName='#{firstname}' AND lastName='#{lastname}'"
    result = SQL_CLIENT.execute(sql)
    result.first
  end

  def self.find_teacher(name)
    @array_of_users = []
    sql = "SELECT * FROM [mtc_admin].[user] WHERE identifier='#{name}'"
    result = SQL_CLIENT.execute(sql)
    @array_of_users = result.each{|row| row.map}
  end

  def self.find_school(school_id)
    @array_of_schools = []
    sql = "SELECT * FROM [mtc_admin].[school] WHERE id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    @array_of_schools = result.each{|row| row.map}
  end

  def self.find_school_by_dfeNumber(school_dfeNumber)
    @array_of_schools = []
    sql = "SELECT * FROM [mtc_admin].[school] WHERE dfeNumber='#{school_dfeNumber}'"
    result = SQL_CLIENT.execute(sql)
    @array_of_schools = result.each{|row| row.map}
  end

  def self.list_of_pupils_from_school(school_id)
    @array_of_pupils = []
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    @array_of_pupils = result.each{|row| row.map}
  end


end