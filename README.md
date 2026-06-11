## What Did You Build?

We built **Home Health Matcher**, an AI-powered housing search dashboard that helps renters find homes based not only on rent, bedrooms, and location, but also on health-related community factors like preventive care access, diabetes prevalence, transit access, nearby hospitals, and affordability.

Instead of forcing someone to compare housing listings in one tab and community health data in another, the app brings both together in one guided workflow: describe the kind of home and neighborhood you want, get ranked matches, inspect health and housing metrics, view nearby healthcare resources, and compare listings on a map.

## Who Has This Problem?

Our target user is a renter like Maria, a working parent managing a chronic health condition while trying to move her family into a safer, healthier, and still affordable home.

Today, Maria might search Zillow or Apartments.com for rent and bedrooms, then separately Google nearby hospitals, public transit, neighborhood safety, food access, and health resources. That process is slow, fragmented, and emotionally exhausting. The homes that look cheapest are not always the best fit for her family's long-term health, and the healthiest areas may appear unaffordable unless she can compare tradeoffs clearly.

This problem also affects caregivers, older adults, people with diabetes or asthma, public health navigators, housing counselors, and anyone trying to make a housing decision where health access matters as much as price.

## How Does Your App Solve It?

Home Health Matcher turns a plain-language housing need into a ranked list of healthier housing matches.

A user can type something like, "I need a 2-bedroom rental under $2,400 near transit and healthcare," and the app parses that intent using an AI fallback chain. It then ranks listings using housing fit plus community health indicators. After using the app, the renter can quickly see which homes are affordable, which neighborhoods have stronger health signals, what care resources are nearby, and why a listing matched.

The most important demo workflow is:

- Open the dashboard.
- Enter or select a guided housing search prompt.
- Run search and see the AI parser label.
- Compare ranked listings, health scores, map pins, charts, and nearby healthcare resources.
- Open a listing detail view and save a listing or search.

## How Did You Build It?

We built the app as a Next.js prototype with React, TypeScript, Tailwind CSS, Leaflet maps, Recharts visualizations, and Lucide icons.

The backend search route uses a resilient AI parsing chain:

- OCI Generative AI first, when credentials are configured.
- Vercel AI Gateway fallback.
- A deterministic local parser so the demo still works without cloud credentials.

The app uses seeded fictional rental listings near real 04043-area place names, public-data-inspired community metrics, local ranking logic, map visualization, health and housing overview cards, healthcare resource panels, saved listings/search state, and a responsive dashboard UI.

## Demo URL

`https://your-demo-url.vercel.app`

## Repo URL

`https://github.com/your-username/your-repo-name`

## Video URL

`N/A`

# Scoring Breakdown

## Demand Reality And Problem Severity

Housing search is already stressful, but it becomes much harder when health needs are part of the decision. Renters with chronic conditions, families with children, older adults, caregivers, and people without reliable transportation often need to know more than "Can I afford this home?" They need to know whether the home is near healthcare, whether the community has stronger preventive care access, whether transit is realistic, and whether the area supports healthier living.

Today, that research is scattered across rental sites, Google Maps, public health dashboards, transit pages, and local resource lists. That makes the decision slow, confusing, and easy to get wrong. The pain is severe because housing decisions are expensive, infrequent, and high-stakes: choosing the wrong place can affect healthcare access, monthly budget, commute burden, and long-term health outcomes.

## Target Customer And Market Scope

The primary customer is a health-conscious renter or family searching for affordable housing while balancing medical access and quality-of-life needs. A specific example is a parent managing diabetes who needs a rental under budget, near transit, and close to primary care or preventive health resources.

This problem also extends to housing counselors, public health navigators, Medicaid care coordinators, social workers, employers supporting relocation, and local governments trying to connect residents with healthier housing choices. The need is broader than one user because millions of people make housing decisions while also managing healthcare access, transportation constraints, affordability, and chronic disease risk.

## Solution Fit And Product Design

Home Health Matcher makes the user's life better by combining housing search and health-context evaluation in one dashboard. Instead of comparing rental listings in one place and health/community resources elsewhere, users can describe what they need in plain language and immediately see ranked housing matches.

The app shows listings, rent, location, match reasons, health scores, nearby healthcare resources, community health metrics, charts, and a map. The most important workflow is simple: enter a housing need, run search, review ranked homes, inspect why each match is healthy or affordable, and open listing details. That directly reduces research time and makes tradeoffs clearer.

## Technical Execution And Demo Proof

The repo contains a working Next.js prototype with a real dashboard experience. It uses React, TypeScript, Tailwind CSS, Leaflet maps, Recharts, seeded housing data, ranking logic, saved listings/search state, and an API route for search parsing.

The search route is built with a practical AI fallback chain: OCI Generative AI first, Vercel AI Gateway second, and a deterministic local parser last so the demo still works even without cloud credentials. Judges can open the app locally with `npm run dev`, test guided prompts, type their own search, verify ranked results, inspect the map, open details, and see which parser handled the query.

## Differentiation And Investment Readiness

Most housing search tools optimize for price, bedrooms, photos, and location. Home Health Matcher is different because it treats health access and community context as first-class search criteria. That creates a more meaningful decision layer for renters whose housing choices directly affect healthcare access and long-term wellbeing.

This could become important because the product sits at the intersection of housing, healthcare, public health, and benefits navigation. With real listing integrations, verified public health datasets, payer or nonprofit partnerships, and personalized health preferences, it could grow from a prototype into a decision-support platform for healthier housing placement.
