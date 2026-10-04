import sys
import os

# Ensure backend directory takes precedence in sys.path so 'api' resolves to backend/api
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir in sys.path:
    sys.path.remove(root_dir)

from main import app

__all__ = ["app"]
