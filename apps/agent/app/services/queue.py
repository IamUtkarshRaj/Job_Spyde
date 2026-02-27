import json
import asyncio
from app.redis_client import redis_client
from app.api.agents import RunRequest
from app.agents.supervisor import supervisor_app
from app.models.agent import AgentState
from app.database import supabase
from app.collectors.orchestrator import CollectorOrchestrator
from app.models.job import JobFilter

QUEUE_NAME = "agent_runs_queue"

async def enqueue_agent_run(user_id: str, config: dict):
    """Pushes a new agent run task to Redis."""
    task = {
        "user_id": user_id,
        "config": config,
        "status": "pending"
    }
    await redis_client.lpush(QUEUE_NAME, json.dumps(task))
    print(f"Enqueued agent run for user {user_id}")

async def process_queue():
    """Background worker to process the queue."""
    print("Started Redis queue processor...")
    while True:
        try:
            # Block until item is in queue
            result = await redis_client.brpop(QUEUE_NAME, timeout=5)
            if result:
                queue, item_json = result
                item = json.loads(item_json)
                user_id = item["user_id"]
                
                print(f"Processing agent run for {user_id}")
                
                # Setup initial state
                state = AgentState(user_id=user_id, collected_jobs=[])
                
                # Fetch mock jobs for testing if actually deploying we would run CollectorOrchestrator here
                # Or we can just run it
                orchestrator = CollectorOrchestrator()
                # Mock query
                query = JobFilter(roles=["Software Engineer"], locations=["Remote"])
                collected = await orchestrator.run_all(query)
                state.collected_jobs = collected
                
                # Run the LangGraph App
                final_state = await supervisor_app.ainvoke(state.model_dump())
                
                print(f"Finished processing run for {user_id}. Final stats:")
                print(f"- Filtered: {len(final_state.get('filtered_jobs', []))}")
                print(f"- Matched: {len(final_state.get('matched_jobs', []))}")
                print(f"- Drafts: {len(final_state.get('resume_drafts', {}))}")
                
        except Exception as e:
            print(f"Queue processing error: {e}")
        
        await asyncio.sleep(1)
