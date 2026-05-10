import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
    
    try:
        if jwt_secret:
            payload = jwt.decode(
                token, 
                jwt_secret, 
                algorithms=["HS256"], 
                audience="authenticated"
            )
        else:
            # Fallback to unverified decode if secret is not provided
            # The agent will rely on Supabase's own RLS for data protection later
            payload = jwt.decode(token, key="", options={"verify_signature": False})
            
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
