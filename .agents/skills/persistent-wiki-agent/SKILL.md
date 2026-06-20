---
name: persistent-wiki-agent
description: Build and maintain a persistent, compounding markdown wiki from sources. Use for incremental knowledge-base ingest/query/lint workflows.
---

# Persistent Wiki Agent

This skill applies the pattern from:
https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## Core Idea

Use a three-layer system:

1. **Raw sources**: immutable input documents.
2. **Wiki**: LLM-maintained markdown knowledge base.
3. **Schema**: agent instructions (e.g., `AGENTS.md`) defining structure and workflows.

Instead of re-doing retrieval each query, the agent incrementally updates the wiki as a persistent artifact.

## Required Workflows

### 1) Ingest

When a new source arrives:

1. Read source.
2. Write/update source summary page.
3. Update related entity/concept/topic pages.
4. Update `index.md`.
5. Append an entry to `log.md`.
6. Flag contradictions with prior claims and record status.

### 2) Query

When answering:

1. Read `index.md` first to locate relevant pages.
2. Read only relevant wiki pages.
3. Return synthesis with page citations.
4. If answer is reusable, save it back as a new wiki page and link it.

### 3) Lint (Health Check)

Periodically check for:

- Contradictions across pages
- Stale or superseded claims
- Orphan pages (few/no inbound links)
- Missing concept pages
- Missing cross-references
- High-value gaps to fill with new sources

## File Conventions

- `index.md`: content catalog (links + one-line summaries)
- `log.md`: append-only timeline of ingest/query/lint operations
- Keep pages interlinked with explicit `[[wiki links]]` or markdown links
- Prefer updates over duplicate pages

## Operating Rules

- Never edit raw source files.
- Always preserve provenance (cite source page and date when possible).
- Reconcile contradictions explicitly; do not silently overwrite.
- Keep edits incremental and traceable through `log.md`.

