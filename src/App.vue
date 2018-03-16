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
                width="25px">
            </a>
          </td>
          <td><a :href="'https://musicbrainz.org/recording/'+ recording.id" target="_blank">{{ (recording.work && recording.work.title) || `----- NO WORK TITLE ${recording.title}` }}</a></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import nathan from './data/nathan-milstein.json'

export default {
  name: 'app',
  data () {
    return {
      name: '',
      recordings: []
    }
  },

  methods: {
    reverse () {
      this.recordings = this.recordings.reverse()
    }
  },

  created () {
    try {
      this.recordings = nathan
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style lang="sass" src="bulma"></style>
<style scoped>
.date {
  width:8rem;
}
</style>
