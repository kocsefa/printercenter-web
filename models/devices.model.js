const mongoose = require('mongoose')
const config = require('../config')
const Schema = mongoose.Schema

mongoose.connect(config.connectionString, { useNewUrlParser: true, useUnifiedTopology: true })

const deviceSchema = new Schema({
    ipAddress: String,
    manufacturer: String,
    colorModes: Array,
    size: Array,
    model: String
})

const deviceModel = mongoose.model('device', deviceSchema, 'devices')

module.exports = deviceModel