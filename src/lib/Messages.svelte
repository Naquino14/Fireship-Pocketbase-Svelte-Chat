<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { pb, currentUser } from "./funnychat";
  import type { Record } from "pocketbase";

  let messages = [];

  // onmount is called at the beginning of the component lifecycle
  onMount(async () => {
    console.log("mounted");

    // fetch the last 50 messages from the database, sorted by creation time
    const resultList = await pb.collection("messages").getList(1, 50, {
      sort: "created",
      expand: "user", // expand allows us to include user data relationally to the message
    });
    messages = resultList.items;
  });
</script>

{#if $currentUser}
  <div class="messages">
    {#each messages as message (message.id)}
      <div class="message">
        <small>sent by @{message.expand?.user?.username}</small>
        <p class="message-text">{message.text}</p>
      </div>
    {/each}
  </div>
{/if}
