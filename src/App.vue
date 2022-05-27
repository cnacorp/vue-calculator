<template>
  <!-- <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app> -->
  <div id="app" >
    <main style="">
      <router-view/>
    </main>
  </div>
</template>
<script>

export default {
  data () {
    return {
      is_loading: false,
      loading_timeout: 0,
      show: false,
      show_splash: false
    }
  },
  components: {
  },
  methods: {
    
  },
  mounted () {
  }
};
</script>
