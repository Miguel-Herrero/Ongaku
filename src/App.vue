<template>
  <div id="app" class="container">
    <h1 class="title has-text-centered">Nathan Milstein</h1>
    <h2 class="subtitle has-text-centered">{{ recordings && recordings.length }} grabaciones</h2>

    <button  @click="reverse">Reverse</button>

    <table class="table">
      <thead>
        <tr>
          <td class="date">Date</td>
          <td></td>
          <td>Title</td>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(recording, index) in recordings" :key="index">
          <td>{{ recording.begin }}</td>
          <td>
            <a :href="recording.spotifyUrl" target="_blank">
              <img
                v-if="recording.spotifyUrl"
                src="./assets/spotify-icon.png"
                width="20em">
            </a>
          </td>
          <td><a :href="'https://musicbrainz.org/recording/'+ recording.id" target="_blank">{{ (recording.work && recording.work.title) || `----- NO WORK TITLE ${recording.title}` }}</a></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import async from 'async'
import nathan from './data/nathan-milstein.json'

export default {
  name: 'app',
  data () {
    return {
      name: '',
      recordings: [],
      interval: undefined,
      data: {}
    }
  },

  methods: {
    reverse () {
      this.recordings = this.recordings.reverse()
    },
    saveFile (dataToSave) {
      const data = JSON.stringify(dataToSave)
      const blob = new Blob([data], {type: 'text/plain'})
      const e = document.createEvent('MouseEvents'),
      a = document.createElement('a');
      a.download = "data.json";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      console.log('DESCARGADO')
    },
    fetchRecording (recordingId, index, array) {
      return axios.get(`http://musicbrainz.org/ws/2/recording/${recordingId}?inc=url-rels+work-rels&fmt=json`)
        .then(response => {
          if (response 
            && response.data 
            && response.data.relations 
            && response.data.relations.length) {

            // Find current recording in general array, to add info later
            const index = this.recordings.findIndex(recording => {
              return recording.id == recordingId
            })

            const updatedRecording = this.recordings[index]

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
            this.recordings.splice(index, 1, updatedRecording)
          }

          if (index === array.length - 1 ) {
            // If it's last array's item, save the data into a file
            this.saveFile(this.recordings)
          }
          return 'hola'
        })
    }
  },

  created () {
    try {
      // this.recordings = nathan
    } catch (error) {
      console.error(error)
    }

    if (this.recordings && this.recordings.length) return

    return axios.get('http://musicbrainz.org/ws/2/artist/0a428818-2623-406e-8453-600dce442e78?inc=recording-rels&fmt=json')
      .then(response => {
        this.name = response.data.name
        this.recordings = response.data.relations.map(recording => {
          return {
            attributes: recording.attributes,
            type: recording.type,
            begin: recording.begin,
            end: recording.end,
            title: recording.recording.title,
            id: recording.recording.id
          }
        }).sort(function (a, b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.begin) - new Date(a.begin);
        })

        this.reverse()

        var i = 0;
        this.interval = setInterval(() => {
          this.fetchRecording(this.recordings[i].id, i, this.recordings)
          i++;
          // if(i === 50) clearInterval(this.interval);
          if(i === this.recordings.length) clearInterval(this.interval);
        }, 1500);
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  destroyed () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="sass" src="bulma"></style>
<style scoped>
.date {
  width:8rem;
}
</style>
