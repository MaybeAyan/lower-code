<template>
  <div class="app">
    <Editor v-model="state" />
  </div>
</template>

<script lang="ts" setup>
import {provide, ref} from 'vue'
import data from './data.json'
import Editor from './packages/editor'
import {registerConfig as config} from './utils/editor-config'


const state:any = ref(data)

provide('config',config) // 注入组件的配置
provide('data',state)
</script>

<style lang="scss">
  .app {
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
</style>
