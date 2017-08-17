require_relative '../helpers/request_helper'
require 'pry'
require 'httparty'

Dir["../helpers/*.**"].each {|file| require file }

BASE_URL = ENV['BASE_URL'] ||= 'http://localhost:3001'

RSpec.configure do |config|
  config.default_formatter = "d"
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end
end
