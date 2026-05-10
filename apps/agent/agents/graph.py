from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.nodes.filter_jobs import filter_jobs_node
from agents.nodes.match_scorer import match_scorer_node
from agents.nodes.optimize_decision import optimize_decision_node
from agents.nodes.resume_optimizer import resume_optimizer_node

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("filter_jobs", filter_jobs_node)
    workflow.add_node("match_scorer", match_scorer_node)
    workflow.add_node("resume_optimizer", resume_optimizer_node)
    
    workflow.set_entry_point("filter_jobs")
    workflow.add_edge("filter_jobs", "match_scorer")
    
    workflow.add_conditional_edges(
        "match_scorer",
        optimize_decision_node,
        {
            "optimize": "resume_optimizer",
            "end": END
        }
    )
    
    workflow.add_edge("resume_optimizer", END)
    
    return workflow.compile()

graph = build_graph()
