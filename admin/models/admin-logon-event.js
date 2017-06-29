const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const AdminLogonEvent = new Schema({
  sessionId: {type: String},
  isAuthenticated: {type: Boolean, required: true},
  errorMsg: String,
  body: {type: String, maxLength: 2000},
  remoteIp: {type: String},
  userAgent: {type: String},
  loginMethod: {type: String, required: true},

  // Successful authentication only
  ncaEmailAddress: String,
  ncaUserType: {type: String},
  ncaUserName: {type: String},
  ncaSessionToken: {type: String},
  school: {type: Number, ref: 'School'},
  role: {type: String}
}, {timestamps: true})

module.exports = mongoose.model('AdminLogonEvent', AdminLogonEvent)
