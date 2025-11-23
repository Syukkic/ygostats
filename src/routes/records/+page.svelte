<svelte:head>
	<title>Records</title>
</svelte:head>

<form method="post" action="?/createRecord">
	<fieldset>
		<legend>硬幣投擲結果</legend>
		<label>
			<input type="radio" name="coin_flip" value="Head" required />
			正面
		</label>
		<label>
			<input type="radio" name="coin_flip" value="Tail" required />
			反面
		</label>
	</fieldset>
	<fieldset>
		<legend>是否先手</legend>
		<label>
			<input type="radio" name="is_first" value="Yes" required />
			先手
		</label>
		<label>
			<input type="radio" name="is_first" value="No" required />
			後手
		</label>
	</fieldset>
	<fieldset>
		<legend>對局勝負</legend>
		<label>
			<input type="radio" name="match_result" value="win" required />
			勝利
		</label>
		<label>
			<input type="radio" name="match_result" value="lose" required />
			失敗
		</label>
	</fieldset>
	<button type="submit">保存記錄</button>
</form>
