require 'settingslogic'

class BrowserstackSettings < Settingslogic
  source File.join(File.dirname(__FILE__), '../../config/browserstack.yml')

  def self.platforms
    YAML.load_file(source).map { |k, _v|   k }
  end
end
