<script lang="ts">
  import type { ComponentProps } from "svelte";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import { Button } from "$lib/components/ui/button/index.js";
  
  let { variant = "ghost", ...restProps }: ComponentProps<typeof Button> =
   $props();
 </script>
  
 <Button {variant} {...restProps}>
  Last Video Date
  <CalendarIcon class="ml-2" />
 </Button>