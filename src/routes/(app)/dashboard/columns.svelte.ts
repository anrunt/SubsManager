import type { YoutubeSubsAll } from "$lib/types/types";
import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index";
import { Checkbox } from "$lib/components/ui/checkbox/index";
import { getMaxSelection } from "./subscriptions.svelte";
import LastVideoDate from "./lastVideoDate.svelte";
import DataTableVideoDateButton from "./data-table-videoDate-button.svelte";

const MAX_SELECTION = $derived(getMaxSelection());

export const columns: ColumnDef<YoutubeSubsAll>[] = [
  {
    id: "select",
    header: ({ table }) => 
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected(),
        disabled: 
          !table.getIsAllPageRowsSelected() && 
          table.getSelectedRowModel().rows.length >= MAX_SELECTION && 
          !table.getIsSomePageRowsSelected(),
        onCheckedChange: (value) => {
          const shouldSelect = !!value;
          const selectedTotal = table.getSelectedRowModel().rows.length;
          const pageRows = table.getRowModel().rows;
          const unselectedOnPage = pageRows.filter((row) => !row.getIsSelected());
          const remaining = Math.max(0, MAX_SELECTION - selectedTotal);

          if (shouldSelect) {
            if (remaining === 0) {
              table.toggleAllPageRowsSelected(false);
            };
            const toSelect = unselectedOnPage.slice(0, remaining);
            toSelect.forEach((row) => row.toggleSelected(true));
          } else {
            table.toggleAllPageRowsSelected(false);
          }
        },
        "aria-label": "Select all",
      }),
    cell: ({ table, row }) => 
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        disabled: !row.getIsSelected() && table.getSelectedRowModel().rows.length >= MAX_SELECTION,
        onCheckedChange: (value) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
    size: 20,
    minSize: 20,
    maxSize: 20,
  },
  {
    accessorKey: "channelPicture",
    header: "Profile Picture",
    size: 80,
    minSize: 80,
    maxSize: 80,
  },
  {
    accessorKey: "channelName",
    header: "Name",
    size: 300,
    minSize: 200,
    maxSize: 400,
  },
  {
    accessorKey: "lastVideoPublishedAt",
    header: ({ column }) => {
      return renderComponent(DataTableVideoDateButton, {
        onclick: column.getToggleSortingHandler()
      });
    },
    cell: ({ row }) => {
      const lastVideoPublishedAt = row.original.lastVideoPublishedAt;
      if (!lastVideoPublishedAt) return "No videos";
      return renderComponent(LastVideoDate, { lastVideoPublishedAt });
    },
  },
  {
    accessorKey: "channelLink",
    header: "Link",
  },
  {
    accessorKey: "subscriptionId",
    header: "subscriptionID",
  },
];