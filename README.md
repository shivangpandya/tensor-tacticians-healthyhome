# HealthyHome Finder

HealthyHome Finder is a Vercel-ready Next.js prototype for helping health-conscious renters find affordable homes near healthier communities and healthcare resources.

The dashboard uses seeded fictional listings near real 04043-area place names, public-data-inspired community metrics, and a health-heavy matching score. It is demo software, not medical, financial, or real-estate advice.

## Local Development

```bash
npm install
npm run lint
npm run test
npm run build
npm run dev
```

Open `http://localhost:3000`.

## AI Fallback Chain

`POST /api/search` attempts search parsing in this order:

1. OCI Generative AI, using server-side OCI API signing.
2. Vercel AI Gateway, using the OpenAI-compatible chat completions endpoint.
3. Deterministic local parser, so the demo still works without cloud credentials.

The UI shows which parser handled the request.

## Environment Variables

Copy `.env.example` to `.env.local` for local testing. Add real values in Vercel project settings before deployment.

```bash
cp .env.example .env.local
```

Required only when using OCI:

- `OCI_REGION`
- `OCI_TENANCY_OCID`
- `OCI_USER_OCID`
- `OCI_FINGERPRINT`
- `OCI_PRIVATE_KEY`
- `OCI_PRIVATE_KEY_PASSPHRASE`, only if needed
- `OCI_COMPARTMENT_OCID`
- `OCI_GENAI_MODEL_ID` or `OCI_GENAI_ENDPOINT_ID`
- `OCI_GENAI_ENDPOINT_URL`, optional override

Required only when using Vercel AI Gateway fallback:

- `AI_GATEWAY_API_KEY`
- `AI_GATEWAY_MODEL`

## GitHub Push

After the app runs locally:

```bash
git status
git add .
git commit -m "feat: build HealthyHome Finder MVP"
git branch -M main
git remote add origin https://github.com/<OWNER>/<REPO>.git
git push -u origin main
```

Create the GitHub repository first. If the local project already has files, do not initialize the GitHub repo with a README, license, or `.gitignore`.

## Vercel Import

1. In Vercel, import the GitHub repository.
2. Select framework preset: `Next.js`.
3. Add environment variables in Vercel, not GitHub.
4. Deploy from `main`.
5. Test guided prompts, typed search, OCI fallback, Vercel AI Gateway fallback, map, charts, save state, and mobile layout.

## References Used

- GitHub repository creation: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- GitHub remote setup: https://docs.github.com/en/get-started/git-basics/managing-remote-repositories
- Vercel Git deployments: https://vercel.com/docs/git
- Vercel AI Gateway: https://vercel.com/docs/ai-gateway
- OCI TypeScript/JavaScript SDK note: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm
- OCI SDK configuration concepts: https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm
