<script lang="ts">
  import { onMount } from "svelte";

  let { data } = $props();

  onMount(() => {
    console.log(data);
  });
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-black">
  <a
    href="login"
    class="flex h-16 w-72 cursor-pointer items-center justify-center rounded-md bg-white p-2 text-xl text-black"
  >
    Login
  </a>
</div>
