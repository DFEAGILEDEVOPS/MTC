Given(/^there are pupils who attended the check$/) do
  MongoDbHelper.change_pupil_attendance('Pupil', 'Two', 9991001)
  MongoDbHelper.change_pupil_attendance('Pupil', 'Three', 9991001)
  MongoDbHelper.change_pupil_attendance('Pupil', 'Four', 9991001)
  MongoDbHelper.change_pupil_attendance('Pupil', 'Five', 9991001)
  MongoDbHelper.change_pupil_attendance('Pupil', 'Six', 9991001)
end