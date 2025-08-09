import type { YoutubeSubs } from "$lib/types/types";

let subscriptions = $state<YoutubeSubs[]>([]);

export function getSubscriptions() {
  return subscriptions;
}

export function setSubscriptions(value: YoutubeSubs[]) {
  subscriptions = value;
}
