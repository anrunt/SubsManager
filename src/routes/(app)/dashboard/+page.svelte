<script lang="ts">
  import { onMount } from "svelte";
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns.svelte";
  import { getSubscriptions, setMaxSelection } from "./subscriptions.svelte";
  import { enhance } from "$app/forms";
  import * as Dialog from "$lib/components/ui/dialog/index";
  import * as Table from "$lib/components/ui/table/index.js";
  import { invalidateAll } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index";
  import { FolderDown, FolderUp } from 'lucide-svelte';

  let { data } = $props();

  let dialogOpen = $state(false);
  let importDialogOpen = $state(false);
  let isDeleting = $state(false);
  let importSubsFormAction: HTMLFormElement;
  let importSubsFiles: FileList | null = $state(null);
  let importSubsFile = $derived(() => {
    return importSubsFiles && importSubsFiles.length > 0 ? importSubsFiles[0] : null;
  });

  let selectedSubscriptions = $derived(getSubscriptions());
  let selectedSubscriptionsIds = $derived(selectedSubscriptions.map((value) => value.subscriptionId));

  let subsLockTimeReset = data.subsLockTimeReset;

  let hours = Math.floor(subsLockTimeReset / 3600);
  let minutes = Math.floor((subsLockTimeReset % 3600) / 60);

  function exportSubscriptions() {
    const jsonSubs = JSON.stringify(data.subscriptions, null, 2);

    const blob = new Blob([jsonSubs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions:${data.user?.username}.json`;
    link.click();
  }

  function importSubscriptions() {
    // There we will add checking for the size of the file
    const file = importSubsFile();
    if (!file) {
      console.error('No file selected');
      return;
    }

    if (file.type !== 'application/json') {
      console.error('File is not a JSON file');
      return;
    }

    const fileSize = file.size;
    if (fileSize > 1 * 1024 * 1024) {
      console.error('File size is too large');
      return;
    }

    console.log(file);
    importSubsFormAction.requestSubmit();
  }

  $effect(() => {
    setMaxSelection(data.remainingSubs);
  });

  onMount(() => {
    console.log(data.subscriptions);
  });
</script>

<div class="mt-2 flex flex-col gap-2">
  <div class="flex items-center justify-between mx-2">
    <div class="flex items-center gap-4">
      <Dialog.Root bind:open={dialogOpen}>
        <Dialog.Trigger
          class="text-md flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#dc2626] px-6 text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
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
                  await invalidateAll();
                  dialogOpen = false;
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

    <div class="flex items-center justify-center gap-4">
      <Button onclick={exportSubscriptions} class="h-12 text-md gap-2 cursor-pointer">
        Export Subscriptions
        <FolderDown size={22} class="size-[22px]"/>
      </Button>

      <!--There we will need formaction-->
      <Dialog.Root bind:open={importDialogOpen}>
        <Dialog.Trigger
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-4 py-2 text-md gap-2 cursor-pointer"
        >
          Import Subscriptions
          <FolderUp size={22} class="size-[22px]"/>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title class="text-xl">Import Subscriptions</Dialog.Title>
            <Dialog.Description class="text-md">
              Import your subscriptions from a JSON file.
            </Dialog.Description>
          </Dialog.Header>
          <div>
            <form bind:this={importSubsFormAction} action="?/importSubscriptions" enctype="multipart/form-data" method="post" use:enhance={() => {
              return async ({result}) => {
                if (result.type === "success") {
                  await invalidateAll();
                  importDialogOpen = false;
                }
              }
            }}>
              <div class="space-y-3">
                <label class="block">
                  <div class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                      <path d="M10 9l5 5m0-5l-5 5"/>
                    </svg>
                    <span>{importSubsFile()?.name ?? 'Choose JSON file'}</span>
                  </div>
                  <input 
                    bind:files={importSubsFiles} 
                    type="file" 
                    multiple={false} 
                    name="subscriptions" 
                    accept=".json"
                    class="sr-only"
                  />
                  <input name="currentSubscriptions" type="hidden" value={JSON.stringify(data.subscriptions)} />
                </label>
                {#if importSubsFile()}
                  <div class="text-xs text-muted-foreground">
                    Selected: {importSubsFile()?.name} ({((importSubsFile()?.size ?? 0) / 1024).toFixed(1)} KB)
                  </div>
                {/if}
              </div>
            </form>
          </div>
          <Dialog.Footer>
            <Button onclick={importSubscriptions} class="h-12 text-md gap-2 cursor-pointer">
              Import
              <FolderUp size={22} class="size-[22px]"/>
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  </div>

  <DataTable data={data.subscriptions} {columns} />
</div>
