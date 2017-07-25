let insertData = require('./insertData.js')
insertData(function(err){
  if(err){
    console.log('error in insertData...')
    console.dir(err)
  } else {
    console.log('Done')
  }
})
