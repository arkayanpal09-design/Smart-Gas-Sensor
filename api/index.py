import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Ensure backend directory takes precedence in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir in sys.path:
    sys.path.remove(root_dir)

try:
    from main import app
except Exception as e:
    app = FastAPI()
    err_msg = str(e)
    err_tb = traceback.format_exc()

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    def error_handler(full_path: str):
        return JSONResponse(
            status_code=500,
            content={"error": err_msg, "traceback": err_tb}
        )

__all__ = ["app"]
