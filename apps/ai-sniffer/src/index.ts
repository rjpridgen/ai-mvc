/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Queue consumer: a Worker that can consume from a
 * Queue: https://developers.cloudflare.com/queues/get-started/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const body: {
			url: string
		} = await request.json()

		const webpageRequest = await fetch(new URL(body.url))
		const contents = await webpageRequest.text()

		const res = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
			messages: [
				{role: "system", content: "You scrape webpages for IP ranges and hostnames."},
				{role: "user", content: `Retrieve the hostnames provided from the following HTML webpage's page:\n\n<webpage>${contents}</contents>`}
			],
			response_format: {
				type: "object",
				required: ["hostnames"],
				json_schema: {
					type: "object",
					properties: {
						hostnames: {
							type: "array",
							items: {
								type: "string"
							}
						}
					}
				}
			},
			stream: false
		})

		return Response.json(res)
	}
	// // Our fetch handler is invoked on a HTTP request: we can send a message to a queue
	// // during (or after) a request.
	// // https://developers.cloudflare.com/queues/platform/javascript-apis/#producer
	// async fetch(req, env, ctx): Promise<Response> {
	// 	// To send a message on a queue, we need to create the queue first
	// 	// https://developers.cloudflare.com/queues/get-started/#3-create-a-queue
	// 	await env.MY_QUEUE.send({
	// 		url: req.url,
	// 		method: req.method,
	// 		headers: Object.fromEntries(req.headers),
	// 	});
	// 	return new Response('Sent message to the queue');
	// },
	// // The queue handler is invoked when a batch of messages is ready to be delivered
	// // https://developers.cloudflare.com/queues/platform/javascript-apis/#messagebatch
	// async queue(batch, env): Promise<void> {
	// 	// A queue consumer can make requests to other endpoints on the Internet,
	// 	// write to R2 object storage, query a D1 Database, and much more.
	// 	for (let message of batch.messages) {
	// 		// Process each message (we'll just log these)
	// 		console.log(`message ${message.id} processed: ${JSON.stringify(message.body)}`);
	// 	}
	// },
} satisfies ExportedHandler<Env, Error>;
