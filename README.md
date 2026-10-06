# Finance 0→1 · 医药与金融学习

Mobile-first static PWA at https://hurenee38-tech.github.io/finance-zero-to-one/

- 30 self-authored beginner lessons in six modules, each with an applied exercise.
- 4 sourced historical cases and 4 clearly labelled simulated cases.
- 10 CFA Level I foundation topics, 2026/2027 weight selector, 60 original practice questions. Not official exam content or a complete exam preparation curriculum.
- Local learning progress, notes, bookmarks, wrong-answer review and JSON backup/import. No cross-device account synchronization.
- Six educational calculators: EV, explicit-flow NPV, conventional-flow IRR, equity dilution, single-node rNPV and patient funnel.
- Two dated public-source briefing feeds in data/neuro.json and data/finance.json. See BRIEFING_PROTOCOL.md for the write contract.

Site data contains public educational content only. Personal progress is stored locally in the browser. Daily automation publication is contingent on successful generation, GitHub commit and Pages deployment; the UI distinguishes launch editions and scheduled editions. This app does not implement native OS push notifications.

Content checked 2026-10-06. Official CFA outline: https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-i-exam


## BioFinance Hub v3
Bottom navigation: Today, Research, Drugs, Finance, Library. Existing lesson IDs l01–l30 and the `finance01-progress-v2` storage key are retained. New l31–l100 use the same completion and note system. Existing v2 exports still import and now include notes for new entity types.

Data: research/papers, drugs/pipelines, preclinical, modalities, clinical, library/tools. Structured daily paper and trial records merge into these views using BRIEFING_PROTOCOL.md. Archives preserve entities beyond the 90-brief history. Entity links join papers, targets, trials, sponsors and finance lessons. No personal note is published to the public repository.

Initial coverage: 100 educational lessons; 3 verified primary paper explainers; 19 ClinicalTrials.gov trial snapshots; 16 modality cards; 2 explicitly marked mechanism-stage preclinical leads; clinical data reading, historic deal cases, terminated-trial review and estimated completion calendar. A selected evidence collection, not an exhaustive global pipeline database. Trial phases do not establish regulatory approval. No cloud progress synchronization is configured.

Validation: Node syntax checks, 27 route render checks, original progress/note preservation, entity bookmark links, and navigation to lesson 100. Browser viewport and offline checks are separately recorded when available.
