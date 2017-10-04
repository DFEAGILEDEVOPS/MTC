require_relative 'upn_helper'
class UpnGenerator

  def self.generate
    la_code = UpnHelper.collection_of_la_codes.sample
    estab = 4.times.map {rand(4)}.join
    year = 2.times.map {rand(2)}.join
    serial = 3.times.map {rand(3)}.join
    upn = [la_code + estab + year + serial]
    index= 2
    @array = []
    upn.first.chars.each do |char|
      @array << (char.to_i * index)
      index += 1
      @array
    end
     p (UpnHelper.check_letter_hash[@array.inject(0, :+) % 23]) + upn.first
  end
end