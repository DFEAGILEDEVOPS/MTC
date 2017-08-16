require 'active_support/core_ext/string/inflections'
require 'site_prism'
require 'capybara'
require 'site_prism/page'

module SitePrism
  class Page
    def self.inherited(subclass)
      SitePrismSubclass << subclass
    end

  end
end
