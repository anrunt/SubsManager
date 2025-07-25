import type { YoutubeSubs } from "$lib/types/types";
import type { ColumnDef } from "@tanstack/table-core";

export const columns: ColumnDef<YoutubeSubs>[] = [
  {
    accessorKey: "channelPicture",
    header: "Picture"
  },
  {
    accessorKey: "channelName",
    header: "Name"
  },
  {
    accessorKey: "channelLink",
    header: "Link"
  },
];