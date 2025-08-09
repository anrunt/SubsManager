<script lang="ts">
  import { onMount } from "svelte";
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns";
  import { getSubscriptions } from "./subscriptions.svelte";
  import { enhance } from "$app/forms";
  import * as Dialog from "$lib/components/ui/dialog/index";
  import * as Table from "$lib/components/ui/table/index.js";

  let { data } = $props();

  onMount(() => {
    console.log(data.subscriptions);
  });

  let selectedSubscriptions = $derived(getSubscriptions());
  let selectedSubscriptionsIds = $derived(selectedSubscriptions.map((value) => value.subscriptionId));

  let dialogOpen = $state(false);
</script>

<div class="mt-2 flex flex-col gap-2">
  <div class="flex items-center gap-4">
    <Dialog.Root bind:open={dialogOpen}>
      <Dialog.Trigger
        class="ml-2 text-md flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#dc2626] px-6 text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={selectedSubscriptions.length === 0}
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
            return async ({result}) => {
              if (result.type === "success") {
                dialogOpen = false;
              }
            }
          }}>
            <input name="selectedSubscriptions" type="hidden" value={selectedSubscriptionsIds} />
            <button
              class="text-md flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#dc2626] px-6 text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedSubscriptions.length === 0}
            >
              Delete Selected
            </button>
          </form>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>

    <p>Selected Subscriptions: {selectedSubscriptions.length}</p>
  </div>
  <DataTable data={data.subscriptions} {columns} />
</div>
