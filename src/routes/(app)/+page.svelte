<script lang="ts">
  let { data } = $props();
</script>

<section class="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
  <div class="space-y-6">
    <h1 class="text-6xl md:text-7xl font-bold tracking-tight text-foreground">
      SubsManager
    </h1>
    
    <p class="max-w-3xl mx-auto text-balance text-muted-foreground leading-relaxed text-lg md:text-xl">
      A fast, simple way to clean up your subscriptions. Filter and sort
      by last video date to spot inactive channels and remove them easily.
    </p>
  </div>

  {#if data?.user}
    <div class="flex items-center justify-center">
      <a
        href="/dashboard"
        class="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <span>Go to Dashboard</span>
        <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </a>
    </div>
  {:else}
    <div class="flex items-center justify-center">
      <a
        href="/login"
        class="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        <span>Get Started</span>
        <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </a>
    </div>
  {/if}
</section>