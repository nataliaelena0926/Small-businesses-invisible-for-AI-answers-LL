# Official Google Business Profile activation

The MVP is functional in Demo mode without Google credentials. Sample reviews use the official v4 list-response structure in `src/lib/review-demo.json`; reply drafting and approval are simulated. Nothing is posted to Google in Demo mode.

For real owner OAuth, configure a Google Cloud project approved for Business Profile API access, enable Account Management, Business Information and Google My Business APIs, and create a Web application OAuth client with `https://www.googleapis.com/auth/business.manage` consent. Add this exact redirect URI:

`https://visibly-business-beacon.lovable.app/api/public/google-business/callback`

Save `GOOGLE_BUSINESS_CLIENT_ID` and `GOOGLE_BUSINESS_CLIENT_SECRET` through Lovable's secure secrets form. Do not put credentials in source or chat. Existing `GOOGLE_BUSINESS_APP_ORIGIN` and `GOOGLE_BUSINESS_TOKEN_KEY` provide the published origin and encryption. Publish the code before testing consent on that origin.

Each owner connects their own account and selects an authorized account and location. Access tokens remain request-local on the server; only encrypted refresh tokens are stored for continuing access. Onboarding OAuth does not require Premium; review reads and approved replies do. Review content is not persisted or sent to AI.

Official review reads use `/mybusiness/v4` Google's v4 review API host directly under the user's own OAuth grant. Reply posting uses **PUT** `/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply` with `{ "comment": "..." }`, after exact-text approval, owner location verification and checking that no reply already exists. The reply is read back; mutations are never automatically retried.

Google-format fixture data is never substituted after a live API error. Draft generation is explicitly simulated even in Official mode. OAuth consent, live reads and posting remain unverified until Google credentials and approval are provided. OAuth does not exempt the application from Google's content policies or guarantee ranking improvements.