<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { ArrowUp, ArrowDown } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button/index.js";

  let { variant = "ghost", column, ...restProps }: ComponentProps<typeof Button> & { column?: any } = $props();
  
  let sortDirection = $derived(column?.getIsSorted());
</script>

<Button {variant} {...restProps}>
  Last Video Date
  {#if sortDirection === "desc"}
    <ArrowDown class="ml-2" />
  {:else}
    <ArrowUp class="ml-2" />
  {/if}
</Button>