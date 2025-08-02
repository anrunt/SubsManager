import type { YoutubeSubs } from "$lib/types/types";
import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "$lib/components/ui/data-table/index";
import { Checkbox } from "$lib/components/ui/checkbox/index";

export const columns: ColumnDef<YoutubeSubs>[] = [
  {
    id: "select",
    header: ({ table }) => 
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
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
    size: 20,
    minSize: 20,
    maxSize: 20,
  },
  {
    accessorKey: "channelPicture",
    header: "Picture",
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
    accessorKey: "channelLink",
    header: "Link",
  },
  {
    accessorKey: "subscriptionId",
    header: "subscriptionID",
  },
];