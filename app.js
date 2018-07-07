const RssParser = require('rss-parser')

let parser = new RssParser()
parser.parseURL('https://share.dmhy.org/topics/rss/rss.xml?keyword=%E9%A9%9A%E7%88%86%E5%8D%B1%E6%A9%9F%7C%E5%85%A8%E9%87%91%E5%B1%9E+1080+%E6%BC%AB%E6%B8%B8')
.then(feed => {
  feed.items.forEach(o => {
    console.log(o.enclosure.url)
  })
})
.catch(err => {
  console.error(err)
})
