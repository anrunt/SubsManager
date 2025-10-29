<script lang="ts">
  import { ArrowRight, Filter, Gauge, Trash2 } from "lucide-svelte";
  import { CldVideoPlayer } from "svelte-cloudinary";

  let { data } = $props();
</script>

<div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
  <div class="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.35),transparent_60%)] blur-2xl"></div>
  <div class="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.35),transparent_60%)] blur-2xl"></div>
  <div class="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(255,255,255,0.08),transparent_60%)]"></div>
</div>

<section class="relative overflow-hidden">
  <div class="mx-auto max-w-6xl px-6 pt-24 pb-12 sm:pt-32 sm:pb-16">
    <div class="text-center space-y-6">
      <span class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs font-medium text-muted-foreground">
        Open-source • Privacy-friendly
      </span>

      <h1 class="text-5xl md:text-7xl font-bold tracking-tight">
        <span class="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">SubsManager</span>
      </h1>

      <p class="mx-auto max-w-2xl text-balance text-muted-foreground leading-relaxed text-base md:text-lg">
        Clean up your YouTube subscriptions in minutes. Find inactive channels,
        batch unsubscribe, and keep your feed fresh.
      </p>

      <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
        {#if data?.user}
          <a
            href="/dashboard"
            class="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Go to Dashboard
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5 will-change:transform" />
          </a>
        {:else}
          <a
            href="/login"
            class="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            Get Started
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#features"
            class="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/30 px-6 py-3 font-medium text-foreground/90 hover:bg-card/50"
          >
            Learn more
          </a>
        {/if}
      </div>
    </div>
  </div>
</section>

<section id="features" class="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div class="group relative rounded-xl border border-border/60 bg-card/30 p-6 transition-colors hover:bg-card/50">
      <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/0 ring-1 ring-inset ring-blue-500/30 text-blue-300">
        <Filter class="h-5 w-5" />
      </div>
      <h3 class="text-lg font-semibold tracking-tight text-foreground">Filter by last video date</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">Instantly surface inactive channels you no longer watch.</p>
    </div>

    <div class="group relative rounded-xl border border-border/60 bg-card/30 p-6 transition-colors hover:bg-card/50">
      <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/0 ring-1 ring-inset ring-blue-500/30 text-blue-300">
        <Gauge class="h-5 w-5" />
      </div>
      <h3 class="text-lg font-semibold tracking-tight text-foreground">Fast by default</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">Optimized tables and caching for thousands of subscriptions.</p>
    </div>

    <div class="group relative rounded-xl border border-border/60 bg-card/30 p-6 transition-colors hover:bg-card/50">
      <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/0 ring-1 ring-inset ring-blue-500/30 text-blue-300">
        <Trash2 class="h-5 w-5" />
      </div>
      <h3 class="text-lg font-semibold tracking-tight text-foreground">Bulk removal, safely</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">Batch actions with clear confirmations.</p>
    </div>
  </div>
</section>

<section id="video-showcase" class="mx-auto max-w-6xl pb-24">
  <CldVideoPlayer width="1920" height="1080" src="managesubsvideo"/>
</section>