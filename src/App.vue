<script setup lang="ts">
import { RouterView } from 'vue-router'

import NavBar from './components/NavBar.vue'
import '@fortawesome/fontawesome-free/css/all.css';



</script>

<template>
  <div id="app">
    <NavBar />
    <RouterView />
  </div>
</template>


