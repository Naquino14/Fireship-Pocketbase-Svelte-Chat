<script lang="ts">
  import { currentUser, pb } from "./funnychat";

  let username: string;
  let password: string;

  const login = async () => {
    await pb.collection("users").authWithPassword(username, password);
  };

  const signUp = async () => {
    try {
      const data = {
        username,
        password,
        passwordConfirm: password,
        name: username,
      };

      const createdUser = await pb.collection("users").create(data);
      await login();
    } catch (error) {
      console.error(error);
    }
  };

  const signout = () => {
    pb.authStore.clear();
  };
</script>

<!-- by putting a $ before a variable it subscribes to the variable reactively-->
{#if $currentUser}
  <p>Signed in as {$currentUser.username}</p>
  <button on:click={signout}>Signout</button>
{:else}
  <p>You are signed out. Log in here:</p>
  <!-- Adding a bar after a binding allows the user to add event modifiers -->
  <form on:submit|preventDefault>
    <!-- bind: value allows us to change a variable without fancy hook shenanigans like we would in react -->
    <input type="text" bind:value={username} placeholder="Username" />
    <input type="password" bind:value={password} placeholder="Password" />
    <button on:click={signUp}>Sign up</button>
    <button on:click={login}>Log in</button>
  </form>
{/if}
