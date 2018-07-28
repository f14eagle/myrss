global.__basedir = __dirname

const config = require('config')
const prompt = require('prompt')

const _ = require('lodash')
const Promise = require('bluebird')

const db = require('./lib/db')
const exportFile = require('./lib/exportFile')

prompt.start()
// prompt.get(['days'], (err, result) => {
//   let days = result.days || 7
//   days = numeral(days).value()
//   if(days <= 0){
//     days = 7
//   }
//
//   startDate = moment().add(-days, 'days')
//   console.log('检查该日期后所有的更新: ' + startDate.format('YYYY-MM-DD'))
//
//   startDb()
//   .then(execute)
// })

db.connect()
.then(exportFile)
