<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";

  let { children } = $props();

  let showPrivacyNotice = $state(true);
  let hydrated = $state(false);

  onMount(() => {
    try {
      const dismissed = typeof localStorage !== "undefined" && localStorage.getItem("privacyNoticeDismissed");
      showPrivacyNotice = !dismissed;
    } catch {}
    hydrated = true;
  });
</script>

{#if hydrated && showPrivacyNotice}
  <div class="bg-blue-600 text-white text-sm px-4 py-3 flex items-center justify-center gap-2">
    <span>
      This app uses Google user data (profile and YouTube subscriptions) only to
      provide requested features. See our
      <a href="/privacy" class="underline font-medium">Privacy Policy</a>.
    </span>
    <button class="ml-4 rounded bg-blue-700 px-2 py-1" onclick={() => { showPrivacyNotice = false; try { localStorage.setItem("privacyNoticeDismissed", "1"); } catch {} }}>
      Dismiss
    </button>
  </div>
{/if}

{@render children()}