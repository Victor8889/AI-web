<script>
import Home from '../../views/personInfo.vue'
import Layout from './Layout.vue'
export { Layout }
export default {

  components: { Layout, Home },
  methods: {
    navigateToOther() {
      this.$router.push({ name: '#/home' })
    },
  },

}
</script>

<template>
  <Layout>
    <template #chatLayout>
      <!-- <router-view />
      111111111111111 -->
      <button @click="navigateToOther">
        Go to Other Component
      </button>

      <!-- <home></home> -->
    </template>
  </Layout>
</template>

<style></style>
