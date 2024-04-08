require 'cucumber/formatter/console'
require 'cucumber/formatter/io'

# run with cucumber -d -f Cucumber::Formatter::ListTags

module Cucumber
  module Formatter
    class ListTags
      include Io
      include Console

      def initialize(step_mother, path_or_io, options)
        @io = ensure_io(path_or_io, "list_tags")
        @all_tags = []
      end

      def tag_name(tag_name)
        @all_tags << tag_name
      end

      def after_features(features)
        @all_tags.uniq.sort.each {|tag| @io.puts tag}
      end
    end
  end
end
