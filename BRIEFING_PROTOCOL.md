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
