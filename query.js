const config = require('config')
const moment = require('moment')
const numeral = require('numeral')
const fs = require('fs')
const prompt = require('prompt')

const _ = require('lodash')
const Promise = require('bluebird')
const RssParser = require('rss-parser')
const Datastore = require('nedb')

var startDate = null
var feeds = []
var parser = new RssParser()
var db = new Datastore({
  filename: './db/anim'
})
db = Promise.promisifyAll(db)

var lastPubDate = moment(require('./lastPubDate.json').date, "YYYY-MM-DD")
if(lastPubDate){
  //console.log('Check RSS after: ' + lastPubDate)
}
var maxDate

prompt.start()
console.log('请输入需要检查的天数,默认为最近7天')
prompt.get(['days'], (err, result) => {
  let days = result.days || 7
  days = numeral(days).value()
  if(days <= 0){
    days = 7
  }

  startDate = moment().add(-days, 'days')
  console.log('检查该日期后所有的更新: ' + startDate.format('YYYY-MM-DD'))

  startDb()
  .then(execute)
})

function startDb(){
  return db.loadDatabaseAsync()
    .then(err => {
      if(err){
        console.log('读取数据库发生错误: ', err)
        throw err
      }else{
        console.log('数据库连接成功！')
      }
    })
}

function execute(){
  return findPromise()
    .then(docs => {
      console.log('海贼王: ' + docs.length)
      docs.forEach(o => {
        console.log(o.title)
      })
    })
}

function findPromise(){
  return new Promise( (resolve, reject) => {
    db.find({
      title: { $regex: /海贼王/ }
    })
    .sort({ pubDateFull: -1 })
    .exec((err, docs) => {
      if(err){
        reject(err)
      }else{
        resolve(docs)
      }
    })
  })
}
