global.__basedir = __dirname

const config = require('config')
const moment = require('moment')
const numeral = require('numeral')
const fs = require('fs')
const prompt = require('prompt')

const _ = require('lodash')
const Promise = require('bluebird')
const RssParser = require('rss-parser')

const db = require('./lib/db')
const exportFile = require('./lib/exportFile')
const download = require('./lib/download')

prompt.start()

console.log('1. 导出记录列表')
console.log('2. 更新所有文件状态并导出记录列表')

prompt.get(['action'], (err, result) => {
  let action = result.action
  let func = null
  if(action == 1){
    func = exportFileTask
  }else if(action == 2){
    func = resetDownloadStatusTask
  }

  if(func){
    db.connect()
    .then(func)
    .then(() => {
      console.log('任务执行完成!')
    })
  }
})

function resetDownloadStatusTask(){
  return db.updateAsync(
      { status: 'NEW' },
      { $set: {status: 'CHECKED'} },
      { multi: true }
    )
    .then(() => {
      console.log('更新下载状态！')
    })
    .then(exportFile)
}

function exportFileTask(){
  return exportFile()
}

function execute(){
  return findPromise()
    .then(docs => {
      console.log('docs: ' + docs.length)
      docs.forEach(o => {
        console.log(o.title)
      })
    })
}

function findPromise(){
  return new Promise( (resolve, reject) => {
    db.find({
      //title: { $regex: /海贼王/ }
    })
    .sort({ anim: 1, pubDateFull: -1 })
    .exec((err, docs) => {
      if(err){
        reject(err)
      }else{
        resolve(docs)
      }
    })
  })
}
