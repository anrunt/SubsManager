let subscriptions = $state<string[]>([]);

export function getSubscriptions() {
  return subscriptions;
}

export function setSubscriptions(value: string[]) {
  subscriptions = value;
}
