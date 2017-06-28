require File.dirname(__FILE__) + '/site_prism_page'
require File.dirname(__FILE__) + '/site_prism_sub'
require_all File.dirname(__FILE__) + '/page_objects/*_section.rb'
require_all File.dirname(__FILE__) + '/page_objects/*_page.rb'

SitePrismSubclass.results.each_pair do |method_name, class_name|
  self.class.send(:define_method, method_name) do
    instance_variable_set("@#{method_name}_var", instance_variable_get("@#{method_name}_var") || class_name.new)
  end
end
