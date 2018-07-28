const path = require('path')
const Excel = require('exceljs')
const Promise = require('bluebird')

var db = require('./db')

function download(){
  console.log('---- 创建下载任务 ----')

  return db.connect()
    .then(readDocs)
    .then(docs => {
      console.log('新发现记录数: ' + docs.length)

      if(!docs.length){
        return
      }

      if(docs.length > 20){
        console.log('新记录数量超过限制，请检查后手动进行下载')
        return
      }

      return Promise.mapSeries(docs, createDownloadTask)
        .then(() => {
          console.log('下载任务创建完成！')
        })
        .then(updateDownloadStatus)
    })
}

function createDownloadTask(doc){
  console.log('创建下载任务: ' + doc.title)
}

function updateDownloadStatus(){
  return db.updateAsync(
      { status: 'NEW' },
      { $set: {status: 'DOWNLOAD'} },
      { multi: true }
    )
    .then(() => {
      console.log('更新下载状态！')
    })
}

function readDocs(){
  return new Promise( (resolve, reject) => {
    db.find({
      status: 'NEW'
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

module.exports = () => {
  return download()
}
