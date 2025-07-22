<script lang="ts">
  import { onMount } from "svelte";

  let { data } = $props();

  onMount(() => {
    console.log(data);
  });
</script>

<h1>Dashboard</h1>