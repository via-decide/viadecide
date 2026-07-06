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
You are the Cockpit Orchestrator. The user wants to analyze our past conversation logs to find the specific tasks where the agent hallucinated, failed, or made mistakes, and the user had to reject or correct the response. 
The conversation logs are located in: `/Users/dharamdaxini/.gemini/antigravity-ide/brain/0fe1929d-fad7-4fad-8468-ffc9668f4843/.system_generated/logs/transcript.jsonl`.

You must spawn 8 subagents to investigate different segments of the conversation history and employ different analytical strategies to find these instances.

Assign the following tasks to the 8 subagents:
1. Agent 1 (Search Expert - Error Patterns): Use grep to search the transcript for user messages containing keywords like "hallucinate", "wrong", "incorrect", "rejected", "no that's not right", "bug".
2. Agent 2 (Search Expert - User Corrections): Search the transcript for user inputs that indicate a correction, such as "don't do that", "stop", "revert", "fix", or "no".
3. Agent 3 (Search Expert - Time Chunk A): Use terminal commands (like head/tail) to review the first 500 lines of the transcript for tasks that were corrected by the user.
4. Agent 4 (Search Expert - Time Chunk B): Review lines 500-1000 of the transcript for similar corrections.
5. Agent 5 (Search Expert - Time Chunk C): Review lines 1000-1500 of the transcript for similar corrections.
6. Agent 6 (Search Expert - Time Chunk D): Review lines 1500+ of the transcript for recent corrections.
7. Agent 7 (Analyzer): Take the raw findings from Agents 1-6 and identify the *exact* tasks the user is referring to where hallucination/bugs caused a rejection/correction.
8. Agent 8 (Synthesis & Reporting): Aggregate the findings from Agent 7 into a final, detailed report explaining what the tasks were, what the hallucinations were, and how the user corrected them.

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
