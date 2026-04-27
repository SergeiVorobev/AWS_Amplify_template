<script setup lang="ts">
import { RouterView } from "vue-router";
import { RouterLink } from "vue-router";
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/transactions" class="nav-link">Transactions</RouterLink>
    <RouterLink to="/analytics" class="nav-link">Analytics</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 2rem;
  background-color: #1A3A5C;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
}

.nav-link:hover {
  color: #90CAF9;
}

main {
  margin-top: 56px;
}
</style>

