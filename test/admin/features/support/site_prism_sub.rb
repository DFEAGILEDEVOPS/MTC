require 'active_support/core_ext/string/inflections'
require 'site_prism'
require 'capybara'

class SitePrismSubclass
  class << self
    attr_accessor :results
    def <<(input)
      @results ||= {}
      @results[input.to_s.demodulize.underscore] = input
      @results
    end
  end
end
