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



  def self.generate_temporary
    la_code = UpnHelper.collection_of_la_codes.sample
    estab = 4.times.map {rand(4)}.join
    year = 2.times.map {rand(2)}.join
    serial = 2.times.map {rand(2)}.join
    temp_letter_index = rand(0..22)
    temp_letter = UpnHelper.temporary_letter(temp_letter_index)
    upn = [la_code + estab + year + serial + temp_letter]
    upn_with_temp_letter_index = [la_code + estab + year + serial + temp_letter_index.to_s]
    if upn_with_temp_letter_index.first.chars.size == 13
      calc_array = upn_with_temp_letter_index.first.chars
      calc_array.delete_at(12)
      calc_array.delete_at(11)
      calc_array << temp_letter_index.to_s
    else
      calc_array = upn_with_temp_letter_index.first.chars
    end
    index= 2
    @array = []
    # p calc_array
    # p upn
    calc_array.each do |char|
      @array << (char.to_i * index)
      index += 1
      @array
    end
    p (UpnHelper.check_letter_hash[@array.inject(0, :+) % 23]) + upn.first
  end
end
