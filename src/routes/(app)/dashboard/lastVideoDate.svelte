<script>
  let { lastVideoPublishedAt } = $props();
</script>

<div class="text-[16px] text-white ml-3">
  {new Date(lastVideoPublishedAt).toLocaleDateString()}
</div>