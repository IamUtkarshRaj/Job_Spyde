from typing import Dict, Any
from app.models.agent import AgentState

async def application_node(state: AgentState) -> Dict[str, Any]:
    """
    Prepares application metadata and tracks the state.
    In a fully autonomous system, this might use Playwright to submit forms.
    Here, it prepares the 'prep' package for the user.
    """
    print("--- PREPARING APPLICATIONS ---")
    
    # Mocking metadata updates
    messages = list(state.messages)
    messages.append("Application metadata prepared for top matches.")
    
    # We would write to Supabase `status_events` here ideally or via API caller
    
    return {"messages": messages}
