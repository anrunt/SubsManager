<script>
  let { lastVideoPublishedAt } = $props();
</script>

<div class="text-[16px] text-white">
  {new Date(lastVideoPublishedAt).toLocaleDateString()}
</div>