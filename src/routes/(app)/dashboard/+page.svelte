<script lang="ts">
  import { onMount } from "svelte";

  let { data } = $props();

  onMount(() => {
    console.log(data.subscriptions);
  });
</script>

<h1>Dashboard</h1>