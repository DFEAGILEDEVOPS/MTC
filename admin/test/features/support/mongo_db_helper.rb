require 'mongo'
class MongoDbHelper

  def self.pupil_details(upn)
    result = []
    collection=CLIENT[:pupils].find({'upn': upn})
    collection.each {|a| result << a}
    result.first
  end

  def self.pupil_pins
    collection=CLIENT[:pinforpupils]
    @array_of_pins = []
    collection.find.each {|pin| @array_of_pins << pin}
    @array_of_pins.map {|row| row['pin']}
  end

  def self.find_teacher(name)
    collection=CLIENT[:users].find({email: name})
    @array_of_users = []
    collection.find.each {|user| @array_of_users << user}
    @array_of_users
  end

  def self.find_school(school_id)
    collection=CLIENT[:schools].find({'_id': school_id})
    @array_of_schools = []
    collection.find.each {|school| @array_of_schools << school}
    @array_of_schools
  end

  def self.get_id(forename, lastname, school_id)
    result = []
    collection=CLIENT[:pupils].find({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i})
    collection.each {|a| result << a}
    result.first['_id']
  end

  def self.populate_results(forename, lastname, school_id)
    year = Time.now.strftime('%Y')
    id = get_id(forename, lastname, school_id)
    count = CLIENT["answers-#{year}"].find({'pupil': id}).count
    if count > 0
      value = CLIENT["answers-#{year}"].delete_many({'pupil': id})
      raise "Could not delete results for id #{id} " unless value
    end
    data = ResultsCreation.details(id)
    result=CLIENT["answers-#{year}"].insert_one(data)
    raise "Failed to generate the data for results, try again" unless result
  end

  def self.remove_results_for_school(school_id)
    year = Time.now.strftime('%Y')
    collection=CLIENT[:pupils].find({'school': school_id.to_i})
    collection.each do |x|
      id = x['_id']
      count = CLIENT["answers-#{year}"].find({'pupil': id}).count
      if count > 0
        value = CLIENT["answers-#{year}"].delete_many({'pupil': id})
        raise "Could not delete results for all pupil in school with id :#{school_id}" unless value
      end
    end
  end

  def self.change_pupil_attendance(forename, lastname, school_id, flag=false)
    CLIENT[:pupils].update_one({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i},
                               {'$set' => {'hasAttended' => flag}})
  end

  def self.expire_pin(forename, lastname, school_id, flag=true)
    CLIENT[:pupils].update_one({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i},
                               {'$set' => {'pinExpired' => flag}})
  end

  def self.reset_pin(forename, lastname, school_id)
    CLIENT[:pupils].update_one({'foreName': forename, 'lastName': lastname, 'school': school_id.to_i},
                               {'$set' => {'pin' => NIL}})
  end

  def self.get_settings
    collection = CLIENT[:settings].find()
    collection.find.each {|setting| setting}
  end

  def self.latest_setting_log
    collection = CLIENT[:settinglogs].find().sort({createdAt:-1})
    collection.find.each {|setting| setting}
  end

end
