from agents.state import AgentState
from services.embeddings import get_llm

def resume_optimizer_node(state: AgentState):
    llm = get_llm()
    resume = state.get("resume", "")
    jobs = state.get("scored_jobs", [])
    
    if not jobs or not resume:
        return {"optimized_resume": resume}
        
    top_job = jobs[0]
    prompt = f"Optimize this resume for the following job: {top_job['title']} at {top_job['company']}\nResume: {resume}\nProvide the optimized resume text."
    
    try:
        res = llm.invoke(prompt)
        content = res.content
    except Exception as e:
        content = resume + "\n\n(Optimization Failed)"
        
    return {"optimized_resume": content}
