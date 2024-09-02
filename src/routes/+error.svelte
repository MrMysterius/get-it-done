<script>
	import { page } from '$app/stores';
</script>

<div class="outer">
	<div class="inner">
		<h2>{$page.status}</h2>
		<div class="line"></div>
		<h1>{$page.error?.message}</h1>
	</div>
</div>

<style>
	div.outer {
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;

		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	div.inner {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 2em;
	}

	div.line {
		width: 0;
		height: 8em;
		border: grey 2px solid;
		border-radius: 5px 5px 5px 5px;
	}

	h1 {
		font-size: 4em;
	}

	h2 {
		font-size: 8em;
	}

	* {
		font-family: 'Monaspace Krypton', monospace;
		background-color: #1b1b1b;
		color: white;
	}
</style>
