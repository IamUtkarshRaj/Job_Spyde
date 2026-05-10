from agents.state import AgentState

def optimize_decision_node(state: AgentState):
    user_prefs = state.get("user_preferences", {})
    if user_prefs.get("optimize_resume", False):
        return "optimize"
    return "end"
