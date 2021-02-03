class UpnHelper
  def self.collection_of_la_codes
    SqlDbHelper.get_list_of_la_codes
  end

  def self.check_letter_hash
    {
        0 => 'A',
        1 => 'B',
        2 => 'C',
        3 => 'D',
        4 => 'E',
        5 => 'F',
        6 => 'G',
        7 => 'H',
        8 => 'J',
        9 => 'K',
        10 => 'L',
        11 => 'M',
        12 => 'N',
        13 => 'P',
        14 => 'Q',
        15 => 'R',
        16 => 'T',
        17 => 'U',
        18 => 'V',
        19 => 'W',
        20 => 'X',
        21 => 'Y',
        22 => 'Z'
    }
  end
end
