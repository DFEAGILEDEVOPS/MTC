Given(/^I ping the admin app$/) do
  visit ENV["ADMIN_BASE_URL"] + '/ping'
end

Then(/^I should see the correct build and commit info$/) do
  build_commit_hash = JSON.parse page.text
  if current_url.include? 'localhost'
    expect(build_commit_hash['Build']).to eql 'NOT FOUND'
    expect(build_commit_hash['Commit']).to eql 'NOT FOUND'
  else
    expect(build_commit_hash['Build']).to_not eql 'NOT FOUND'
    expect(build_commit_hash['Build']).to include 'dev-build-'
    latest_master_commit = `git rev-parse master`
    expect(build_commit_hash['Commit'].strip).to eql latest_master_commit.strip
  end
end

Given(/^I ping the Pupil app$/) do
  visit ENV["PUPIL_BASE_URL"]
end

Given(/^I ping the Pupil API$/) do
  visit ENV["PUPIL_API_BASE_URL"] + '/ping'
end

Then(/^I should see the correct build and commit info for the pupil app$/) do
  build_commit_hash = {'Build' => page.html.split("\n")[14].split(' ')[2] , 'Commit' => page.html.split("\n")[15].split(' ')[2]}
  if current_url.include? 'localhost'
    expect(build_commit_hash['Build']).to include '#mtc.build#'
    expect(build_commit_hash['Commit']).to include '#mtc.commit#'
  else
    expect(build_commit_hash['Build']).to_not eql '#mtc.build#'
    expect(build_commit_hash['Build']).to include 'dev-build-'
    latest_master_commit = `git rev-parse master`
    expect(build_commit_hash['Commit'].strip).to include latest_master_commit.strip
  end
end
