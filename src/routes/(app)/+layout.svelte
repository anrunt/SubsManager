<script lang="ts">
  import "../../app.css";
  import { enhance } from "$app/forms";
  import { LogIn, LogOut } from "lucide-svelte";

  let { children, data } = $props();
</script>

<nav class="bg-black border-b border-gray-900 p-4">
  <div class="mx-0.5 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/" class="text-white text-2xl font-bold hover:text-gray-300 transition-colors cursor-pointer">
        SubsManager
      </a>

      <a href="/dashboard" class="text-white text-2xl font-medium hover:text-gray-300 transition-colors cursor-pointer">
        Dashboard
      </a>
    </div>

    {#if data.user}
      <form method="POST" action="/?/logout" use:enhance>
        <button
          type="submit"
          class="flex items-center justify-center gap-2 text-md w-32 h-12 bg-red-500 hover:bg-red-800 text-black px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          Logout
          <LogOut size={16} />
        </button>
      </form>
    {:else}
      <a
        href="/login"
        class="flex items-center justify-center gap-2 text-md w-32 h-12 bg-[#5ea500] hover:bg-[#4a8600] text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
        Login
        <LogIn size={16} />
      </a>
    {/if}
  </div>
</nav>

{@render children()}