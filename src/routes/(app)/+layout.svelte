<script lang="ts">
  import "../../app.css";
  import { enhance } from "$app/forms";
  import { LogIn, LogOut } from "lucide-svelte";

  let { children, data } = $props();
</script>

<div class="min-h-dvh flex flex-col">
  <nav class="sticky top-0 z-50 border-b border-border/60 bg-card/20 backdrop-blur supports-[backdrop-filter]:bg-card/10">
    <div class="mx-0.5 px-2">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center gap-4">
          <a href="/" class="text-foreground text-xl font-semibold tracking-tight hover:text-foreground/90 transition-colors cursor-pointer">
            SubsManager
          </a>

          {#if data.user}
            <a href="/dashboard" class="text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Dashboard
            </a>
          {/if}

          <a href="/privacy" class="text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Privacy Policy
          </a>
          <a href="/terms" class="text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Terms of Use
          </a>
        </div>

        {#if data.user}
          <form method="POST" action="/?/logout" use:enhance>
            <button
              type="submit"
              class="flex items-center justify-center gap-2 text-base h-10 w-28 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 rounded-md transition-colors cursor-pointer"
            >
              Logout
              <LogOut size={16} />
            </button>
          </form>
        {:else}
          <a
            href="/login"
            class="flex items-center justify-center gap-2 text-base h-10 w-28 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 rounded-md transition-all duration-200 hover:from-green-700 hover:to-green-800 cursor-pointer"
          >
            Login
            <LogIn size={16} />
          </a>
        {/if}
      </div>
    </div>
  </nav>

  <main class="flex-1">
    {@render children()}
  </main>

  <footer class="bg-black border-t border-gray-900 p-4">
    <div class="mx-0.5 flex items-center justify-between text-sm text-gray-400">
      <p>© {new Date().getFullYear()} SubsManager</p>
      <div class="flex items-center gap-4">
        <a href="/privacy" class="hover:text-gray-200 transition-colors">Privacy Policy</a>
        <a href="/terms" class="hover:text-gray-200 transition-colors">Terms of Use</a>
      </div>
    </div>
  </footer>
</div>