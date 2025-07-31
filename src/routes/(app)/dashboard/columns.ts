import type { YoutubeSubs } from "$lib/types/types";
import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index";
import { Checkbox } from "$lib/components/ui/checkbox/index";

export const columns: ColumnDef<YoutubeSubs>[] = [
  {
    id: "select",
    header: ({ table }) => 
      renderComponent(Checkbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate: !table.getIsAllRowsSelected(),
        onCheckedChange: (value) => table.toggleAllRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) => 
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "channelPicture",
    header: "Picture"
  },
  {
    accessorKey: "channelName",
    header: "Name",
  },
  {
    accessorKey: "channelLink",
    header: "Link"
  },
  {
    accessorKey: "subscriptionId",
    header: "subscriptionID"
  },
];