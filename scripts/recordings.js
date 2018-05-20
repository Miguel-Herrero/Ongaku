const axios = require('axios')
const fs = require('fs')
var path = require('path')

const STREAMING_MUSIC = 'streaming music'
const INSTRUMENT = 'instrument'
const PERFORMANCE = 'performance'
const WORK = 'work'
const TARGET_TYPE = 'target-type'
const COMPOSER = 'composer'
const PARTS = 'parts'

const artistId = '0a428818-2623-406e-8453-600dce442e78'
let maxRecordingsToFetch = 0 // Set to 0 to fetch all recordings
const recordings = {}
const works = {}
const recordingsToDelete = []
const listened = []

function fetchRecording (recordingId, index, max) {
  return axios.get(`http://musicbrainz.org/ws/2/recording/${recordingId}?inc=url-rels+work-rels&fmt=json`)
    .then(response => {
      if (!response || !response.data || !response.data.relations || !response.data.relations.length) return

      const streamingInfo = response.data.relations.find(relation => {
        return (relation.type === STREAMING_MUSIC && relation.url && relation.url.resource)
      })

      recordings[recordingId].streamingUrl = streamingInfo && streamingInfo.url && streamingInfo.url.resource

      const workInfo = response.data.relations.find(relation => {
        return (relation.type === PERFORMANCE && relation[TARGET_TYPE] === WORK)
      })

      if (workInfo && workInfo.work) {
        // Look for work info in our array
        recordings[recordingId].work = {
          id: workInfo.work.id,
          title: workInfo.work.title
        }

        if (works[workInfo.work.id]) return Promise.resolve(works[workInfo.work.id])

        // If work doesn't exist, fetch it
        return axios.get(`http://musicbrainz.org/ws/2/work/${workInfo.work.id}?fmt=json&inc=work-rels+artist-rels`)
          .then(response => {
            const composerInfo = response.data.relations.find(relation => {
              return (relation.type === COMPOSER)
            })

            const partsInfo = response.data.relations.find(relation => {
              return (relation.type === PARTS)
            })
            
            const work = {
              id: workInfo.work.id,
              title: response.data.title,
              composer: {
                id: composerInfo.artist.id,
                name: composerInfo.artist.name,
                begin: composerInfo.begin
              }
            }
            
            if (partsInfo) {
              work.partOf = {
                attribute: partsInfo.attributes[0],
                title: partsInfo.work.title,
                id: partsInfo.work.id,
                ordering: partsInfo['ordering-key']
              }
            }

            works[workInfo.work.id] = work

            return Promise.resolve(work)
          })
      }

      return Promise.resolve()
    })
    .then(work => {
      if (!work) {
        // All recordings should have a work relationship
        // Delete from array while removed from MusicBrainz
        recordingsToDelete.push(recordingId)
        return Promise.resolve()
      }
      // if (!work) return Promise.reject(new Error(`Work relationship for recording ${recordingId} doesn't exist  (${index + 1}/${max})`))

      recordings[recordingId].work = work

      console.log(`OK ${recordingId}: ${index + 1} / ${max}`)

      if (index + 1 === max) {
        // Remove useless recordings
        recordingsToDelete.forEach(recordingId => {
          delete recordings[recordingId]
        })

        const mapped = []

        Object.keys(recordings).forEach(recordingId => {
          const recording = recordings[recordingId]
      
          if (recording.work) {
            mapped.push({
              id: recording.id,
              recordingHref: `https://musicbrainz.org/recording/${recording.id}`,
              composer: recording.work && recording.work.composer && recording.work.composer.name,
              composerId: recording.work && recording.work.composer && recording.work.composer.id,
              composerHref: recording.work && recording.work.composer && recording.work.composer.id && `https://musicbrainz.org/artist/${recording.work.composer.id}`,
              work: recording.work && recording.work.title,
              workHref: recording.work && recording.work.id && `https://musicbrainz.org/work/${recording.work.id}`,
              // work: recording.work && recording.work.partOf && recording.work.partOf.title,
              work_part: recording.work && recording.work.partOf && recording.work.partOf.title,
              recordingDate: recording.date,
              spotify: recording.streamingUrl,
              listened: false
            })
          }
        })

        // console.log(mapped)
        return fs.writeFile(path.resolve(__dirname) + '/../data/recordings.js', JSON.stringify(mapped), 'utf8', (err) => {
          if (err) return console.error(err)

          return console.log('The file was saved!')
        })
      }
    })
    .catch(error => {
      console.error(error.response)
      process.exit(1)
    })
}

return axios.get(`http://musicbrainz.org/ws/2/artist/${artistId}?inc=recording-rels&fmt=json`)
  .then(response => {
    // STORE RECORDINGS LIST
    response.data.relations.forEach(relation => {
      // Solo en las que interpreta el violín (sin los duplicados de “solo violin”)
      if (relation.type === INSTRUMENT && relation.attributes.length === 1) {
        recordings[relation.recording.id] = {
          date: relation.begin,
          id: relation.recording.id
        }
      }
    })

    // FETCH RECORDING INFO
    var i = 0;
    if (!maxRecordingsToFetch || maxRecordingsToFetch < 1) maxRecordingsToFetch = Object.keys(recordings).length

    const interval = setInterval(() => {
      fetchRecording(Object.keys(recordings)[i], i, maxRecordingsToFetch)
      i++;
      if(i === maxRecordingsToFetch) clearInterval(interval);
    }, 1500);
  })
  .catch(console.error)