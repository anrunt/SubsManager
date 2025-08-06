<script lang="ts">
  import { onMount } from "svelte";
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns";
  import { getSubscriptions } from "./subscriptions.svelte";

  let { data } = $props();

  onMount(() => {
    console.log(data.subscriptions);
  });

  let selectedSubscriptions = $derived(getSubscriptions());
</script>

<div class="flex flex-col gap-2 mt-2">
  <div class="flex items-center gap-4">
    <button
      class="flex items-center justify-center gap-2 text-md h-12 px-6 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      disabled={selectedSubscriptions.length === 0}
    >
      Delete Selected
    </button>
    <p>Selected Subscriptions: {selectedSubscriptions.length}</p>
  </div>
  <DataTable data={data.subscriptions} {columns}/>
</div>