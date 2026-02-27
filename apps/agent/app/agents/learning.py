from typing import Dict, Any
from app.models.agent import AgentState

async def learning_node(state: AgentState) -> Dict[str, Any]:
    """
    Analyzes user feedback and updates base preferences.
    This runs at the end or out-of-band based on frontend feedback.
    """
    print("--- LEARNING FROM RESULTS ---")
    
    messages = list(state.messages)
    messages.append(f"Learning step completed. Evaluated {len(state.matched_jobs)} matches.")
    
    # In reality, fetch recent user feedback -> prompt LLM to adjust weights -> update DB
    
    return {"messages": messages}
