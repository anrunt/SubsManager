import type { YoutubeSubsAll } from "$lib/types/types";

let subscriptions = $state<YoutubeSubsAll[]>([]);

export function getSubscriptions() {
  return subscriptions;
}

export function setSubscriptions(value: YoutubeSubsAll[]) {
  subscriptions = value;
}

let max_selection = $state(0);

export function getMaxSelection() {
  return max_selection;
}

export function setMaxSelection(value: number) {
  max_selection = value;
}