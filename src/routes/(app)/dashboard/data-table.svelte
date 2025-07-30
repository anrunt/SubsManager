<script lang="ts" generics="TData, TValue">
  import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
  import {
    createSvelteTable,
    FlexRender,
  } from "$lib/components/ui/data-table/index"
  import * as Table from "$lib/components/ui/table/index"

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  }

  let { data, columns }: DataTableProps<TData, TValue> = $props()

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
    getCoreRowModel: getCoreRowModel()
  })
</script>

<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head colspan={header.colSpan}>
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
            <Table.Cell>
              {#if cell.column.id === "channelPicture"}
                <img 
                  src={cell.getValue() as string} 
                  alt=ChannelPicture
                  class="w-12 h-12 rounded-full object-cover" 
                />
              {:else if cell.column.id == "channelName"}
                <a href={cell.row.getValue("channelLink")} target="_blank" class="text-blue-500 underline text-[16px]">
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