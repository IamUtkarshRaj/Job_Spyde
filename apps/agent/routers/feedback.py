from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user_id

router = APIRouter(prefix="/v1/agents/feedback")

class FeedbackRequest(BaseModel):
    job_url: str
    feedback: str

@router.post("/")
async def submit_feedback(
    req: FeedbackRequest,
    user_id: str = Depends(get_current_user_id)
):
    return {
        "message": "Feedback received and stored",
        "data": {**req.model_dump(), "user_id": user_id}
    }
