const path = require('path')
global.__basedir = path.resolve(__dirname, '../')
const download = require(path.resolve(__basedir, './lib/download'))

download()
.then(() => {
  console.log('Download complete')
})
