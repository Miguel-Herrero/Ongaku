var axios = require('axios')

let recordings = []

let interval

console.time('fetchAPI');
return axios.get('http://musicbrainz.org/ws/2/artist/0a428818-2623-406e-8453-600dce442e78?inc=recording-rels&fmt=json')
  .then(response => {
    recordings = response.data.relations.reduce((recordingsArray, recording) => {
      if (recording.attributes && recording.attributes.length === 1 && recording.attributes[0] === 'violin' && recording.type === 'instrument') {
        recordingsArray.push({
          attributes: recording.attributes,
          type: recording.type,
          begin: recording.begin,
          end: recording.end,
          title: recording.recording.title,
          id: recording.recording.id
        })

        // console.log(recording.recording.id)
      }

      return recordingsArray
    }, []).sort(function (a, b){
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.begin) - new Date(a.begin);
    })
    // recordings = response.data.relations.map(recording => {
    //   return {
    //     attributes: recording.attributes,
    //     type: recording.type,
    //     begin: recording.begin,
    //     end: recording.end,
    //     title: recording.recording.title,
    //     id: recording.recording.id
    //   }
    // }).sort(function (a, b){
    //   // Turn your strings into dates, and then subtract them
    //   // to get a value that is either negative, positive, or zero.
    //   return new Date(b.begin) - new Date(a.begin);
    // })

    var i = 0;
    interval = setInterval(() => {
      fetchRecording(recordings[i].id, i, recordings)
      i++;
      // if(i === 10) clearInterval(interval);
      if(i === recordings.length) clearInterval(interval);
    }, 1000);
  })
  .catch(function (error) {
    console.log(error);
  });

function saveFile (dataToSave) {
  const data = JSON.stringify(dataToSave)
  var fs = require('fs');
  fs.writeFile('../data/myjsonfile.json', data, 'utf8', function(err) {
    if (err) throw err;
    console.timeEnd('fetchAPI');
    console.log('complete');
    }
  )
  // const blob = new Blob([data], {type: 'text/plain'})
  // const e = document.createEvent('MouseEvents'),
  // a = document.createElement('a');
  // a.download = "data.json";
  // a.href = window.URL.createObjectURL(blob);
  // a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  // e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  // a.dispatchEvent(e);
  // console.log('DESCARGADO')
}

function fetchRecording (recordingId, index, array) {
  // console.log('fetchRecording', recordingId, indexa, array.length)
  return axios.get(`http://musicbrainz.org/ws/2/recording/${recordingId}?inc=url-rels+work-rels&fmt=json`)
    .then(response => {
      // console.log(`Fetched ${index}/${array.length}`)
      if (response 
        && response.data 
        && response.data.relations 
        && response.data.relations.length) {
        

        // Find current recording in general array, to add info later
        const recordingIndex = recordings.findIndex(recording => {
          return recording.id == recordingId
        })

        const updatedRecording = recordings[recordingIndex]

        console.log(`Fetched ${index + 1}/${array.length}: ${updatedRecording.id} (${updatedRecording.begin})`)

        // Find Spotify streaming info and add it
        const streamingInfo = response.data.relations.find(relation => {
          return (relation.type === 'streaming music' && relation.url && relation.url.resource)
        })
        updatedRecording.spotifyUrl = streamingInfo && streamingInfo.url && streamingInfo.url.resource

        // Find work info and add it
        const workInfo = response.data.relations.find(relation => {
          return (relation.type === 'performance' && relation['target-type'] === 'work')
        })
        updatedRecording.work = {
          id: workInfo.work.id,
          title: workInfo.work.title || `NO TIENE WORK: ${updatedRecording.title}`
        }

        // Update item in general array
        recordings.splice(recordingIndex, 1, updatedRecording)
      }

      // if (index === 10 - 1 ) {
      if (index === array.length - 1 ) {
        // If it's last array's item, save the data into a file
        saveFile(recordings)
      }
      return 'hola'
    })
    .catch(error => {
      console.log(`Fetched ${index}/${array.length} with ERROR: ${JSON.stringify(error)}`)
      return error
      // throw error
    })
}