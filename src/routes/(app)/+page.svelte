<script lang="ts">
  import { onMount } from "svelte";

  let { data } = $props();

  onMount(() => {
    console.log(data);
  });
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
  {#if data.user}
    <h1>Welcome back, {data.user.username}!</h1>
  {:else}
    <h1>Welcome to SubsManager</h1>
  {/if}
</div>
