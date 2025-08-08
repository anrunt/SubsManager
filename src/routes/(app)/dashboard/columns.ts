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
        disabled: !table.getIsAllPageRowsSelected() && table.getSelectedRowModel().rows.length >= 12 && !table.getIsSomePageRowsSelected(),
        onCheckedChange: (value) => {
          const selectedRows = table.getSelectedRowModel().rows.length;
          const availableRowsNumber = 12 - selectedRows; // 12 - 11 = 1

          if (availableRowsNumber >= 11) {
            table.toggleAllPageRowsSelected(!!value);
          } else if (availableRowsNumber > 0 && availableRowsNumber < 11 && !table.getIsAllPageRowsSelected()) {
            const availableRows = table.getRowModel().rows.slice(0, availableRowsNumber);
            availableRows.forEach(row => row.toggleSelected(!!value));
          } else if (availableRowsNumber > 0 && availableRowsNumber < 11 && table.getIsAllPageRowsSelected()) {
            table.toggleAllPageRowsSelected(!!value);
          } else if (availableRowsNumber === 0) {
            const pageRows = table.getRowModel().rows;
            pageRows.filter(row => row.getIsSelected()).forEach(row => row.toggleSelected(false));
          }
          console.log("Selected rows: ", selectedRows);
        },
        "aria-label": "Select all",
      }),
    cell: ({ table, row }) => 
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        disabled: !row.getIsSelected() && table.getSelectedRowModel().rows.length >= 12,
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
    accessorKey: "channelLink",
    header: "Link",
  },
  {
    accessorKey: "subscriptionId",
    header: "subscriptionID",
  },
];