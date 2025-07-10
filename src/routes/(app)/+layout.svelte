<script lang="ts">
  import "../../app.css";

  let { children, data } = $props();
</script>

<nav class="bg-black border-b border-gray-900 p-4">
  <div class="mx-0.5 flex items-center justify-between">
    <div class="flex items-center">
      <a href="/" class="text-white text-2xl font-bold hover:text-gray-300 transition-colors">
        SubsManager
      </a>
    </div>

    <a
      href="/login"
      class="flex items-center justify-center text-md w-32 h-12 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg transition-colors"
    >
      Login
    </a>
  </div>
</nav>

{@render children()}