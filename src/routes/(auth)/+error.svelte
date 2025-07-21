<script lang="ts">
  import { page } from "$app/state";
</script>

<h1>Error</h1>
<p>Status: {page.status}</p>
<p>{page.error?.message}</p>
<a href="/login">Try again</a>