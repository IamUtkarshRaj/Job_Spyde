from langgraph.graph import StateGraph, END
from app.models.agent import AgentState
from app.agents.job_filter import job_filter_node
from app.agents.job_matching import job_matching_node
from app.agents.resume_optimizer import resume_optimizer_node
from app.agents.application import application_node
from app.agents.learning import learning_node

def should_optimize(state: AgentState) -> str:
    """Conditional edge logic"""
    if state.matched_jobs:
        return "optimize"
    return "learn"

# Create Supervisor Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("filter", job_filter_node)
workflow.add_node("match", job_matching_node)
workflow.add_node("optimize", resume_optimizer_node)
workflow.add_node("apply", application_node)
workflow.add_node("learn", learning_node)

# Add Edges
workflow.set_entry_point("filter")
workflow.add_edge("filter", "match")

# Conditional routing
workflow.add_conditional_edges(
    "match",
    should_optimize,
    {
        "optimize": "optimize",
        "learn": "learn"
    }
)

workflow.add_edge("optimize", "apply")
workflow.add_edge("apply", "learn")
workflow.add_edge("learn", END)

# Compile Graph
supervisor_app = workflow.compile()
