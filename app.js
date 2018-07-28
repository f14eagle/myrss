const config = require('config')
const moment = require('moment')
const numeral = require('numeral')
const fs = require('fs')
const prompt = require('prompt')

const Excel = require('exceljs')
const Promise = require('bluebird')
const RssParser = require('rss-parser')

var startDate = null
var feeds = []
var parser = new RssParser()

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

  loadFeedSettings()
  .then(execute)
})

function execute(rss){
  //var rss = config.get('rss')
  if(rss && rss.length){
    Promise.mapSeries(rss, rssFeed => {
      //console.log('Print download link: ' + rssFeed.name)
      if(rssFeed.download){
        return printDownloadLink(rssFeed)
      }else{
        return
      }
    })
    .then(() => {
      console.log('最新的发布日期: ' + maxDate)

      if(maxDate){
        //fs.writeFileSync('./lastPubDate.json', JSON.stringify({date: maxDate}), {flag: 'w+'})
      }
      writeResultToFile()
    })
  }
}

function loadFeedSettings(){
  console.log('读取 config/rss.xlsx 的内容')
  var wb = new Excel.Workbook();

  return wb.xlsx.readFile('./config/rss.xlsx')
    .then(() => {
      var sheet = wb.getWorksheet(1)
      console.log('读取到行数: ' + sheet.rowCount)

      var data = []
      var header = sheet.getRow(1).values
      for(var i = 2; i <= sheet.rowCount; i++){
        var row = sheet.getRow(i).values
        var o = {}
        for(var j = 1; j < header.length; j++){
          if(typeof row[j] == 'object'){
            o[header[j]] = row[j].text
          }else{
            o[header[j]] = row[j]
          }
        }
        data.push(o)
      }
      return data
  })
}

function printDownloadLink(rssFeed){
  console.log('读取rss: ' + rssFeed.name)
  return parser.parseURL(rssFeed.rss)
  .then(feed => {
    feed.items.forEach(o => {
      if(moment(o.pubDate) <= startDate){
        return
      }
      checkPubDate(o.pubDate)
      console.log('[' + moment(o.pubDate).format('YYYY-MM-DD') + '] - ' + o.title)
      //console.log(o.enclosure.url)

      o.pubDateFull = moment(o.pubDate)
      addFeed(o)
    })
  })
  .catch(err => {
    console.error(err)
  })
}

function addFeed(o){
  feeds.push(o)
}

function checkPubDate(date){
  if(!maxDate || date > maxDate){
    maxDate = date
  }
}

function writeResultToFile(){
  let filename = './output/' + moment().format('YYYY-MM-DD') + '.txt'
  console.log('将结果写入文件: ' + filename)

  //sort feed by publish date
  feeds.sort((a, b) => {
    if(a.pubDateFull > b.pubDateFull){
      return -1
    }else if(a.pubDateFull < b.pubDateFull){
      return 1
    }else{
      return 0
    }
  })
  let filecon = ''
  feeds.forEach(feed => {
    filecon += '[' + feed.pubDateFull.format('YYYY-MM-DD') + '] - ' + feed.title + '\r\n'
    filecon += feed.enclosure.url + '\r\n'
  })
  fs.writeFileSync(filename, filecon, {flag: 'w+'})
}
