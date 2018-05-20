const axios = require('axios')
const fs = require('fs')
var path = require('path')

const listened = []

return axios.get(`http://musicbrainz.org/ws/2/recording?collection=2949d1d4-b6b8-459d-9ae6-1ba131e0b876&fmt=json`)
  .then(response => {
    response.data.recordings.forEach(recording => {
      listened.push(recording.id)
    })

    return fs.writeFile(path.resolve(__dirname) + '/../data/listened.js', JSON.stringify(listened), 'utf8', (err) => {
      if (err) return console.error(err)

      return console.log('Listened recordings saved!')
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })