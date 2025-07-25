<script lang="ts">
  import { onMount } from "svelte";
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns";

  let { data } = $props();

  onMount(() => {
    console.log(data.subscriptions);
  });
</script>

<DataTable data={data.subscriptions} {columns}/>