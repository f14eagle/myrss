const path = require('path')
const Excel = require('exceljs')
const Promise = require('bluebird')

var db = require('./db')
var wb = new Excel.Workbook()
var sheet = null

var template = path.resolve(__basedir, './template/template.xlsx')
var dest = path.resolve(__basedir, './output/anim.xlsx')

function exportFile(){
  console.log('---- 导出文件列表 ----')

  return wb.xlsx.readFile(template)
    .then(() => {
      sheet = wb.getWorksheet(1)
      console.log('读取模板成功')
    })
    .then(() => {
      return db.connect()
    })
    .then(readAllDocs)
    .then(docs => {
      console.log('总共读取记录个数: ' + docs.length)

      docs.forEach(doc => {
        sheet.addRow([
          doc.anim,
          doc.pubDateFull,
          doc.status,
          doc.title,
          doc.enclosure.url,
          doc.link
        ])
      })
    })
    .then(() => {
      console.log('导出到文件：' + dest)
      return wb.xlsx.writeFile(dest)
      .then(() => {
        console.log('文件导出成功!')
      })
    })
}

function readAllDocs(){
  return new Promise( (resolve, reject) => {
    db.find({
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
  return exportFile()
}
