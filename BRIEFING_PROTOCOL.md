# Daily briefing publication contract

Destination: public GitHub repository `hurenee38-tech/finance-zero-to-one`, branch `main`.
Live site: https://hurenee38-tech.github.io/finance-zero-to-one/
The user explicitly requested publishing these two daily briefings to this site. Publish only public-source research and original educational analysis. Never publish private conversations, user profile, account credentials, emails, personal research data or unpublished work.

## Independent channels
- Neurobiology Daily Brief writes only `data/neuro.json`.
- 医药金融晨报 writes only `data/finance.json`.
- Do not edit site code, course data, the other channel, or this contract during a briefing run.
- Preserve existing items. Prepend or replace that channel's same-date scheduled item, retaining the latest 90 items. Do not overwrite another day's entry.

## File schema
```json
{
  "schemaVersion": 1,
  "channel": "neuro",
  "updatedAt": "2026-10-06T01:50:00Z",
  "items": [{
    "id": "neuro-2026-10-06",
    "date": "2026-10-06",
    "source": "scheduled",
    "title": "Descriptive Chinese title",
    "summary": "Two-sentence Chinese summary",
    "sections": [{"heading": "Section title", "body": "Plain text paragraphs, with newline characters. No raw HTML or citation tokens."}],
    "terms": [{"en": "Term", "zh": "中文", "meaning": "Concise explanation"}],
    "sources": [{"title": "Source with publication date", "url": "https://verified-primary-source.example/article"}]
  }]
}
```
Use Asia/Shanghai to determine `date`; use actual generation time ISO8601 for `updatedAt`. The example URLs and dates are placeholders and must never be published as facts. Channels are exactly `neuro` or `finance`. File JSON must parse; body is a string, not an array. Links must be verified HTTP(S) sources. Where useful identify references in prose as [1], [2] and give matching numbered source titles. No GenUI citation syntax in site JSON.

## Safe update workflow
1. Research sources using available web tools. Preserve all original task requirements. Mark publication date, event date, facts vs interpretation, uncertainty and data gaps. Do not fill missing fresh news with undated historical items.
2. Fetch the destination JSON via GitHub `fetch_file`, retaining its current blob SHA. Parse and merge locally/in memory. Require source `scheduled` only for a real automation-generated edition, not test fixtures.
3. Update through GitHub `update_file` using that exact current blob SHA and branch `main`; include the complete merged UTF-8 JSON. Commit message: `Daily <channel> brief YYYY-MM-DD`.
4. If a SHA conflict occurs, fetch current file, merge again preserving intervening items, then retry once. Never force-reset the branch or replace from a stale tree.
5. A successful commit is not yet proof the website deployed. When feasible verify the public Pages JSON at the live site after deployment. Do not claim visible publication unless verified. Report separately "已提交，等待网页发布" when only commit success is known.
6. If writing tools or authorization are unavailable, keep the generated content in the task response and explicitly say site synchronization failed. Do not silently report success or remove existing content. No browser login needed on routine runs.

## Editorial quality
Neuro: prioritize primary research, verified IF>8 and CNS family; if IF cannot be verified, flag it, never guess. Translate title and summarize abstract in Chinese without reproducing copyrighted abstracts in full. Add research question, methods, main results, limitations, vocabulary and 2–5 relevant prior studies per selected paper. Avoid implying correlation is causation or clinical efficacy from preclinical evidence.
Finance: explain one foundational concept with a worked example; 4–6 verified updates when available, the science/business/financial implications, cross-role view, one case/exercise, and one question. Rotate themes across accounting, valuation, financing, capital markets, BD, investing and consulting. Do not fabricate to hit a quota. Explain jargon.
The site is open-to-read and refreshes feeds when opened/resumed or when Refresh is tapped. This is not native OS push notification delivery. The first scheduled successful edition automatically changes the initial verification message.

## Version 3: structured knowledge alongside the brief
The existing channel files and history rules stay compatible. The app reads optional structured arrays inside each dated item and exposes them in permanent topic pages.

### Research channel
Select 2–3 verified primary papers per edition when sufficient suitable sources exist. Broaden coverage across neuroscience, neuro-oncology, immunology, cancer biology, metabolism, GPCR, ageing, drug discovery and AI for science, rotating topics. Do not fabricate to meet a quota. Add an optional `papers` array to the day's item. Each paper must contain:
- `id`: stable DOI-based slug (reuse the same ID when updating a paper).
- `title`: Chinese descriptive title; `date`: original publication date; `topic`; `summary`: original concise synthesis; `checked`: verification date.
- `sections`: heading/body strings covering research question, background, methods, key findings, why it matters, limitations, and translational implications. Explicitly distinguish findings from editorial inference; do not imply preclinical clinical efficacy.
- `sources`: verified primary source title/url; include related prior work with its relationship explained in the sections when available.
- Optional `target`: target/mechanism name for cross-links.
Keep total paraphrase per source within the retrieval tool's source word limit; link to the paper for full detail. Never paste full abstracts. Store the paper in the same channel edition so updating one file is atomic and cannot lose another channel's work.

### Finance / industry channel
Cover innovative medicines across therapeutic areas, including oncology, metabolic, cardiovascular, autoimmune/inflammatory, infectious, rare, renal, liver, respiratory, ophthalmology and CNS. Where a verified clinical registry update is covered, add optional `pipelineUpdates` inside the dated item using the schema in `data/drugs/pipelines.json`. Every entry must include a stable NCT `id`, drug `title`, `company` (registry sponsor), `target`, `modality`, `area`, specific `indication`, trial-specific `stage`, `status`, `trialTitle`, `registryUpdated`, `checked`, `summary`, `endpoints` array, `sources` array, `note` and `risks`; `completion` is optional. Do not equate trial phase with global asset stage or regulatory approval. Do not manufacture numerical efficacy results when the registry has none. Estimated primary completion is not a confirmed readout date. If a field cannot be verified, state unknown. Preclinical discoveries belong to a separately identified research section, not invented NCT records.

When pruning briefs to 90 items, merge papers from pruned research items into the root `archivedPapers` array, and clinical records from pruned finance items into root `archivedPipelines`; deduplicate by stable ID, keeping the latest checked version. Preserve these root arrays on every update. Structured records therefore survive brief pruning; older curated baseline files remain available. This is a selected public-source knowledge base, not an exhaustive global drug database or a live market terminal. The app also reads these archive arrays.


## Daily innovative-drug database maintenance
The finance publisher additionally checks ALL currently collected NCT records (baseline data/drugs/pipelines.json plus finance pipelineUpdates and archivedPipelines), explicitly reporting checked, changed and failed counts. Use the registry interventions to verify asset identity, not just search keywords. Preserve old values on source failure; don't label failed records as freshly verified. Screen new public research, registry updates, sponsor announcements, regulators and exchange filings across therapeutic areas. Include verified new records without claiming global exhaustive coverage.

The same finance edition supports arrays `companies`, `targets`, `deals`, `catalysts`. Each record has stable `id`, `title`, event/publication `date` (or clearly unknown), `checked`, original `summary`, `sections` heading/body strings, and verified `sources` title/url. Company titles should match linked registry sponsor names where possible. Company sections cover platform, lead assets, ownership/partners, financing and strategic changes where verified. Target sections distinguish biological rationale, human validation, druggability, safety, failures and competitors. Deal sections separately state parties, assets, rights, geography, stage, upfront, contingent milestones, royalty, currency and rationale; undisclosed terms stay undisclosed. Catalyst sections give event type, expected date/window, confirmed/estimated/delayed/completed/cancelled status and source; registry completion dates are never automatically readout dates. Correct or cancel prior events rather than silently dropping them.

Keep immutable historical event IDs; refresh mutable company/target profiles by ID. Before pruning to 90 editions, merge removed arrays into root `archivedCompanies`, `archivedTargets`, `archivedDeals`, `archivedCatalysts` by ID, preserving latest checked records and all independent events. Preserve all archive arrays on every update. Root `syncStatus` records actual `checkedAt`, `status` (success/partial/failed), checked/changed/failed counts and Chinese `summary`; use actual results, not scheduled time. Each edition should give recent changes and explicit gaps, never invent changes to fill a quota. Only data/finance.json is written during the run; retain the original financial learning content and publication checks.

## Collapsible reference thinking
After each daily thinking question, add a sections entry with heading `参考思路（先作答，再展开）`, plain-text body and `collapsed: true`. Explain problem decomposition, evidence/assumptions, reasoning steps, a possible answer, common mistakes and self-check criteria. For calculations include formulas, substitution and results. Open questions may have multiple defensible answers. The app renders this as a native details/summary element closed by default; never put HTML into JSON. Preserve all previous content requirements.
