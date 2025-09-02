<script lang="ts">
  import { onMount } from "svelte";
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns.svelte";
  import { getSubscriptions, setMaxSelection } from "./subscriptions.svelte";
  import { enhance } from "$app/forms";
  import * as Dialog from "$lib/components/ui/dialog/index";
  import * as Table from "$lib/components/ui/table/index.js";
  import { invalidateAll } from "$app/navigation";

  let { data } = $props();

  let dialogOpen = $state(false);
  let isDeleting = $state(false);

  let selectedSubscriptions = $derived(getSubscriptions());
  let selectedSubscriptionsIds = $derived(selectedSubscriptions.map((value) => value.subscriptionId));

  let subsLockTimeReset = data.subsLockTimeReset;

  let hours = Math.floor(subsLockTimeReset / 3600);
  let minutes = Math.floor((subsLockTimeReset % 3600) / 60);

  $effect(() => {
    setMaxSelection(data.remainingSubs);
  });

  onMount(() => {
    console.log(data.subscriptions);
  });
</script>

<div class="mt-2 flex flex-col gap-2">
  <div class="flex items-center gap-4">
    <Dialog.Root bind:open={dialogOpen}>
      <Dialog.Trigger
        class="ml-2 text-md flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#dc2626] px-6 text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={selectedSubscriptions.length === 0 || data.remainingSubs === 0}
      >
        Delete
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title class="text-xl">Are you sure absolutely sure?</Dialog.Title>
          <Dialog.Description class="text-md">
            This action cannot be undone. This will permanently delete your selected subscriptions.
          </Dialog.Description>
        </Dialog.Header>
        <div>
          <div class="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="text-left font-semibold">Picture</Table.Head>
                  <Table.Head class="text-right font-semibold">Name</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each selectedSubscriptions as subscription}
                  <Table.Row>
                    <Table.Cell class="text-left">
                      <img src={subscription.channelPicture} alt=ChannelPicture class="w-10 h-10 rounded-full object-cover">
                    </Table.Cell>
                    <Table.Cell class="text-right">{subscription.channelName}</Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>  
          </div>
        </div>
        <Dialog.Footer>
          <form action="?/deleteSubscriptions" method="post" use:enhance={() => {
            isDeleting = true;
            return async ({result}) => {
              isDeleting = false;
              if (result.type === "success") {
                dialogOpen = false;
                await invalidateAll();
              }
            }
          }}>
            <input name="selectedSubscriptions" type="hidden" value={selectedSubscriptionsIds} />
            <button
              class="text-md flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#dc2626] px-6 text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedSubscriptions.length === 0 || isDeleting}
            >
              Delete Selected
              {#if isDeleting}
                <svg 
                  class="animate-spin h-4 w-4 ml-2" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    class="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    stroke-width="4"
                  ></circle>
                  <path 
                    class="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              {/if}
            </button>
          </form>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>

    {#if data.remainingSubs === 0}
      {#if hours > 0}
        <p class="text-orange-600">
          You've reached your daily limit of 50 subscription deletions. Try again in {hours} hour{hours > 1 ? 's' : ''}.
        </p>
      {:else}
        <p class="text-orange-600">
          You've reached your daily limit of 50 subscription deletions. Try again in {minutes} minute{minutes > 1 ? 's' : ''}.
        </p>
      {/if}
    {:else}
      <p>Selected Subscriptions: {selectedSubscriptions.length} / {data.remainingSubs}</p>
    {/if}
  </div>
  <DataTable data={data.subscriptions} {columns} />
</div>
