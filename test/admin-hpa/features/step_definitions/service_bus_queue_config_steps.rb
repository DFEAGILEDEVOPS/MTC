Given(/^I get the deployment config for service bus$/) do
  @config = `node  ./../../deploy/service-bus/get.deploy.config.js`
end

Then(/^I should see the correct config for (.+)$/) do |name|
  config_array = JSON.parse(@config)
  queue_config = get_service_bus_queue(name,config_array)
  expected_config = get_expected_config(name)
  expect(queue_config).to eql expected_config
end


Then(/^the queues should match the expected queues$/) do
  config_array = JSON.parse(@config)
  actual_queues = config_array.map {|queue| queue['name']}
  expected_queues = ["check-completion", "check-marking", "check-notification", "check-sync",
                     "check-validation", "ps-report-schools", "ps-report-staging", "ps-report-export",
                     "pupil-login", "queue-replay", "school-results-cache", "sync-results-to-db-complete"]
  expect(expected_queues).to eql actual_queues
end
