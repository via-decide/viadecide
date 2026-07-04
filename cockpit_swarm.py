import asyncio
import os
import sys
from google.antigravity import Agent, LocalAgentConfig, types

async def main():
    print("🚀 Initializing Cockpit Orchestrator...", flush=True)
    
    config = LocalAgentConfig(
        capabilities=types.CapabilitiesConfig(
            enable_subagents=True,
        )
    )

    prompt = """
You are the Cockpit Orchestrator. The user has deployed a web application to Vercel at the domain 'viadecide.com'.
Specifically, the product page at 'https://viadecide.com/printbydd-store/smarttag-lite' is NOT showing the recent UI updates pushed to the repository.

A curl check showed:
- `x-vercel-cache: HIT`
- `age: 9792`
- `cache-control: public, max-age=0, must-revalidate`

You must spawn 8 subagents to investigate the entire deployment pipeline and find the root cause of this caching failure.

Assign the following tasks to the 8 subagents:
1. Agent 1 (DNS & Network Layer): Investigate Cloudflare and Vercel routing headers.
2. Agent 2 (Edge Cache Validator): Analyze why Vercel is serving an Edge Cache HIT despite `max-age=0`.
3. Agent 3 (Deployment Git State): Check the Vercel deployment status and if the latest Git commit was actually deployed.
4. Agent 4 (Vercel Config Analyzer): Review the `vercel.json` configuration, specifically `cleanUrls`, `headers`, and how it matches without a `.html` extension.
5. Agent 5 (PWA Service Worker Checker): Check if a service worker might be interfering or aggressively caching the old version.
6. Agent 6 (File Hash Comparator): Explain how Vercel caches `cleanUrls` vs files with extensions.
7. Agent 7 (HTML Syntax/Build Validator): Theorize if the build failed silently or was cached prematurely.
8. Agent 8 (Synthesis & Reporting): Aggregate the findings from the 7 agents into a definitive final report on exactly what is broken and how to fix it.

Run this swarm and output the final synthesized report from Agent 8.
    """

    print("🤖 Spawning 8 Subagents to investigate...", flush=True)
    
    try:
        async with Agent(config) as agent:
            response = await agent.chat(prompt)
            print("\n" + "="*80)
            print("FINAL COCKPIT REPORT:")
            print("="*80)
            print(await response.text())
    except Exception as e:
        print(f"Error executing swarm: {e}", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(main())
