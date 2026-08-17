export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }
    return new Response("Adminic Worker is running", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
};
