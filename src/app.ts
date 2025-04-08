import { Hono } from "hono";
import {
	layout,
	parseApproveFormBody,
	renderLoggedOutAuthorizeScreen,
} from "./utils";
import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { MCPSpaceAPI } from "./MCPSpaceAPI";

export type Bindings = Env & {
	OAUTH_PROVIDER: OAuthHelpers;
};

const app = new Hono<{
	Bindings: Bindings;
}>();


// Render an authorization page
app.get("/authorize", async (c) => {
	const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
	const content = await renderLoggedOutAuthorizeScreen(oauthReqInfo);
	return c.html(layout(content, "MyMCPSpace - Authorization"));
});

// The /authorize page has a form that will POST to /approve
// This endpoint is responsible for validating any login information and
// then completing the authorization request with the OAUTH_PROVIDER
app.post("/approve", async (c) => {
	const { action, oauthReqInfo, apiKey } = await parseApproveFormBody(
		await c.req.parseBody(),
	);

	const apiClient = new MCPSpaceAPI(apiKey);
	try {
		const result = await apiClient.getFeed();
	} catch (error) {
		return c.html("INVALID API KEY", 401);
	}

	if (!oauthReqInfo) {
		return c.html("INVALID LOGIN", 401);
	}

	// Generate a random hex string for the user ID
	const user = Array.from(crypto.getRandomValues(new Uint8Array(16)))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	
	// Complete the authorization request
	const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
		request: oauthReqInfo,
		userId: user,
		metadata: {},
		scope: oauthReqInfo.scope,
		props: {
			user,
			apiKey,
		},
	});

	return Response.redirect(redirectTo);
});

export default app;
