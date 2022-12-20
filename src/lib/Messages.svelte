<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { pb, currentUser } from "./funnychat";
  import type { Record } from "pocketbase";

  let messages = [];

  let unsubscribe: () => void;

  // onmount is called at the beginning of the component lifecycle
  onMount(async () => {
    console.log("mounted");

    // fetch the last 50 messages from the database, sorted by creation time
    const resultList = await pb.collection("messages").getList(1, 50, {
      sort: "created",
      expand: "user", // expand allows us to include user data relationally to the message
    });
    messages = resultList.items;

    // subscribe to realtime messages
    unsubscribe = await pb
      .collection("messages")
      .subscribe("*", async ({ action, record }) => {
        try {
          if (action === "create") {
            // fetch the user associated with the message
            const user = await pb.collection("users").getOne(record.user);
            record.expand = { user };
            messages = [...messages, record];
          } else if (action === "delete") {
            messages.filter((m: { id: string }) => m.id !== record.id);
          }
        } catch (error) {
          if ((error.message as string).includes("autocancelled"))
            console.info("Request autocancelled.");
          else console.error("error!", error.message);
        }
      });
  });

  let message: string;
  const sendMessage = async () => {
    const data = {
      text: message,
      user: $currentUser.id,
    };
    await pb.collection("messages").create(data);
  };

  onDestroy(() => {
    console.log("destroyed");
    unsubscribe?.();
  });
</script>

{#if $currentUser}
  <form on:submit|preventDefault={sendMessage}>
    <input bind:value={message} placeholder="Message" type="text" />
    <button on:submit={() => (message = "")} type="submit">Send</button>
  </form>
  <div class="messages">
    {#each messages as message (message.id)}
      <div class="message">
        <small>sent by @{message.expand?.user?.username}</small>
        <p class="message-text">{message.text}</p>
      </div>
    {/each}
  </div>
{/if}
