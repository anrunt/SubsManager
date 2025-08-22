<script lang="ts" generics="TData, TValue">
  import { 
    type ColumnDef,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
  } from "@tanstack/table-core";
  import type { YoutubeSubsAll } from "$lib/types/types";
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index"
  import * as Table from "$lib/components/ui/table/index"
  import { setSubscriptions } from "./subscriptions.svelte";

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  }

  let { data, columns }: DataTableProps<TData, TValue> = $props()

  let rowSelection = $state<RowSelectionState>({});
  let pagination = $state<PaginationState>({pageIndex: 0, pageSize: 11});
  let sorting = $state<SortingState>([]);

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    initialState: {
      columnVisibility: {
        channelLink: false,
        subscriptionId: false
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => (row as YoutubeSubsAll).subscriptionId,
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        pagination = updater(pagination);
      } else {
        pagination = updater;
      }
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        rowSelection = updater(rowSelection);
      } else {
        rowSelection = updater;
      }
    },
    state: {
      get pagination() {
        return pagination;
      },
      get rowSelection() {
        return rowSelection;
      },
      get sorting() {
        return sorting;
      }
    }
  })

  let selectedRows = $derived(
    data && data.length > 0 && table.getSelectedRowModel().rows 
      ? table.getSelectedRowModel().rows.map((row) => row.original as unknown as YoutubeSubsAll)
      : []
  );

  $effect(() => {
    setSubscriptions(selectedRows);
  })

  $inspect("Selected rows inspect:", selectedRows);

  function handlePrevPage(event: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    table.previousPage();
  }

  function handleNextPage(event: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    table.nextPage();
  }
</script>

<div>
  <div class="rounded-md border">
    <Table.Root class="table-fixed w-full">
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head 
                colspan={header.colSpan}
                style="width: {header.getSize()}px; min-width: {header.getSize()}px; max-width: {header.getSize()}px;"
                class="font-semibold text-[16px]"
              >
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() && "selected"}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell 
                style="width: {cell.column.getSize()}px; min-width: {cell.column.getSize()}px; max-width: {cell.column.getSize()}px;"
              >
                {#if cell.column.id === "channelPicture"}
                  <img 
                    src={cell.getValue() as string} 
                    alt=ChannelPicture
                    class="w-12 h-12 rounded-full object-cover" 
                  />
                {:else if cell.column.id == "channelName"}
                  <a href={cell.row.getValue("channelLink")} target="_blank" class="text-white text-[16px] hover:text-gray-300 hover:underline">
                    {cell.row.getValue("channelName")}
                  </a>
                {:else}
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                {/if}
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <div class="flex items-center mr-4 justify-end space-x-2 py-4">
    <div class="flex items-center px-2 text-md">
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
    </div>
    <button
      type="button"
      class="flex items-center justify-center gap-2 text-md w-32 h-12 bg-[#5ea500] hover:bg-[#4a8600] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      onclick={handlePrevPage}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </button>
    <button
      type="button"
      class="flex items-center justify-center gap-2 text-md w-32 h-12 bg-[#5ea500] hover:bg-[#4a8600] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      onclick={handleNextPage}
      disabled={!table.getCanNextPage()}
    >
      Next
    </button>
  </div>
</div>
