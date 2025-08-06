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

<p>Selected Subscriptions: {selectedSubscriptions.length}</p>
<DataTable data={data.subscriptions} {columns}/>