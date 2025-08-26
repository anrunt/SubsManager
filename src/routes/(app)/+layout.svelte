<script lang="ts">
  import "../../app.css";
  import { enhance } from "$app/forms";
  import { LogIn, LogOut } from "lucide-svelte";

  let { children, data } = $props();
</script>

<nav class="bg-black border-b border-gray-900 p-2">
  <div class="mx-0.5 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/" class="text-white text-2xl font-bold hover:text-gray-300 transition-colors cursor-pointer">
        SubsManager
      </a>

      {#if data.user}
        <a href="/dashboard" class="text-white text-2xl font-medium hover:text-gray-300 transition-colors cursor-pointer">
          Dashboard
        </a>
      {/if}
    </div>

    {#if data.user}
      <form method="POST" action="/?/logout" use:enhance>
        <button
          type="submit"
          class="flex items-center justify-center gap-2 text-md w-32 h-12 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          Logout
          <LogOut size={16} />
        </button>
      </form>
    {:else}
      <a
        href="/login"
        class="flex items-center justify-center gap-2 text-md w-32 h-12 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-md transition-all duration-200 hover:from-green-700 hover:to-green-800 cursor-pointer"
      >
        Login
        <LogIn size={16} />
      </a>
    {/if}
  </div>
</nav>

{@render children()}