from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def get_health():
    """
    Backend service health status
    """
    return {"status": "healthy", "service": "Smart Gas Mask Backend"}
