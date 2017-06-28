'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

// Store NCA Auth Tokens to prevent replay attacks
const NcaToolsAuthToken = new Schema({
  _id: { type: String, required: true, trim: true },
  logonDate: { type: Date, required: true },
  ncaUserType: { type: String, required: true },
  ncaUserName: { type: String, required: true },
  ncaEmailAddress: { type: String, required: true },
  school: { type: String, required: true }
}, {timestamps: true});

module.exports = mongoose.model('NcaToolsAuthToken', NcaToolsAuthToken);