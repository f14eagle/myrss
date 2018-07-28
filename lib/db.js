const Promise = require('bluebird')
const Datastore = require('nedb')

var db = new Datastore({
  filename: './db/anim'
})
db = Promise.promisifyAll(db)

module.exports = db

module.exports.connect = () => {
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
