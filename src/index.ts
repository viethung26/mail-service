interface Env {
  [key: string]: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method == "POST") {
			let data = await request.json()
      const resp = await sendEmail(data, env);
      const respText = await resp.text();
			return new Response(respText, {
				status: resp.status,
				statusText: resp.statusText,
				headers: { "content-type": "text/html" },
			});
    }
		return new Response(null, {
			status: 404
		})
  },
};

let sendEmail = async(data: any, env: Env) => {
	let {sendTo, replyTo, replyToName = "", subject = "", message = ""} = data
	let fromEmail = "ken@thangbom.life" // add your from email
	let dkim_domain = "thangbom.life"
	let dkim_selector = "mailchannels"
	
	let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({
			personalizations: [
				{
					to: [
						{
							email: sendTo,
						},
					],
					dkim_domain,
					dkim_selector,
					dkim_private_key: env.DKIM_PRIVATE_KEY,
				},
			],
			from: {
				name: "Weaverse",
				email: fromEmail,
			},
			reply_to: {
				name: replyToName,
				email: replyTo,
			},
			subject,
			content: [
				{
					type: "text/plain",
					value: message,
				},
			],
		}),
	});
	return fetch(send_request);
}