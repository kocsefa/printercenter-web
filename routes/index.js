const express = require('express')
const _ = require('lodash')
const moment = require('moment')
const timezone = require('moment-timezone')
const router = express.Router()
const deviceinfomodel = require('../models/deviceinfo.model')


/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: 'Printer Management' })
})

router.get('/scan-list', async (req, res, next) => {
  const { day } = req.query
  const startDay = moment(day).toDate()
  const endDay = moment(day).add(1, 'days').toDate()

  const scanList = await deviceinfomodel.aggregate([
    { $match: { date: { $lt: endDay, $gte: startDay } } },
    { $group: { _id: null, timestamps: { $addToSet: '$date' } } }
  ])

  let sortedList = []
  if (scanList.length > 0) {
    sortedList = scanList[0].timestamps.map(item => ({ label: moment(item).format('HH:mm:ss'), value: item })).sort()
  }

  return res.json(sortedList)
})

router.get('/info-list', async (req, res, next) => {
  const { dateFilter } = req.query

  const ipAddresses = await deviceinfomodel.find({}).distinct('ipAddress')
  const promises = ipAddresses.map(ip => {
    return new Promise((resolve, reject) => {
      let $match = dateFilter ? { date: { $lte: new Date(dateFilter) } } : {}
      $match.ipAddress = ip
      deviceinfomodel
        .aggregate([
          { $match },
          { $sort: { 'date': -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'devices',
              localField: 'ipAddress',
              foreignField: 'ipAddress',
              as: 'device'
            }
          }
        ],
          function (err, result) {
            if (err) {
              reject(err)
            } else {
              resolve(result[0])
            }
          })
    })
  })

  Promise.all(promises)
    .then(values => {
      values = values.map(value => {
        value.info = _.sortBy(value.info, (val, key) => val.oid)
        value.device = value.device[0]
        return value
      })
      values = _.orderBy(
        values,
        ['device.manufacturer', 'ipAddress'], // Sort edilecek alanlar
        ['desc', 'asc'] // Sort yönü (azalan, artan) (Xerox başta gelsin diye)
      )
      res.json(values)
    })

})

module.exports = router
