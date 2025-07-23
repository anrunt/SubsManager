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

export const mockData: YoutubeSubs[] = [
  {
    channelPicture: "https://yt3.ggpht.com/IQ2vKIPyCuDVLO8f1Fd9SEtwIKOmmwgc1m9zRn_iJSPZbVQd9xKMTfsdRfI8PLk8yEdj8Miv=s240-c-k-c0x00ffffff-no-rj",
    channelName: "Zawod Inwestor",
    channelLink: "https://www.youtube.com/channel/UCG4T6bLDq2TdAdRAp2GDOCw",
    subscriptionId: "L-fFbL5qsG1ElvMYcAqNfe9MrGNcL6VmQELj59ciVGg"
  },
  {
    channelPicture: "https://yt3.ggpht.com/e5UgPEDCKnRXnUISafsdWMNWnAlxU-QaHuwzNsg7iSCmDRnBH_Q_iw9_20XdZuvKm_24jK095A=s240-c-k-c0x00ffffff-no-rj",
    channelName: "SzklanaY2J",
    channelLink: "https://www.youtube.com/channel/UCjPzFw-fLHbWjktSy3D5znw",
    subscriptionId: "L-fFbL5qsG2bMqBpuGGDbIUmBQfnugx2VdDzBrLMtvA"
  }
];