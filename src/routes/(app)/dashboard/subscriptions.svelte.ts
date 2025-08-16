import type { YoutubeSubs } from "$lib/types/types";

let subscriptions = $state<YoutubeSubs[]>([]);

export function getSubscriptions() {
  return subscriptions;
}

export function setSubscriptions(value: YoutubeSubs[]) {
  subscriptions = value;
}

let max_selection = $state(0);

export function getMaxSelection() {
  return max_selection;
}

export function setMaxSelection(value: number) {
  max_selection = value;
}