<script lang="ts">
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  onMount(() => {
    console.log(data);
  });
</script>

<div class="flex h-screen w-full items-center justify-center bg-black">
  <a href={data.url} class="w-72 h-16 text-xl rounded-md flex cursor-pointer items-center justify-center bg-white p-2 text-black">Google Login</a>
</div>