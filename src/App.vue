<script setup lang="ts">
import { RouterView } from 'vue-router'

import NavBar from './components/NavBar.vue' //importing the NavBar component
import '@fortawesome/fontawesome-free/css/all.css';

</script>
<template>
  <div id="app">
    <NavBar /> <!--Using NavBar component-->
    <RouterView />
  </div>
</template>


