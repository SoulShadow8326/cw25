from fastapi import FastAPI
from fastapi.responses import FileResponse
 
import uvicorn
import os
from fastapi import HTTPException
from typing import Any

try:
    from joycon import list_devices, poll_once, is_available
except Exception:
    list_devices = None
    poll_once = None
    is_available = None

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")

if os.path.isdir(DIST_DIR):
    @app.get("/")
    async def root():
        index_path = os.path.join(DIST_DIR, "index.html")
        return FileResponse(index_path, media_type="text/html")

    @app.get("/{full_path:path}")
    async def serve(full_path: str):
        candidate = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        index_path = os.path.join(DIST_DIR, "index.html")
        return FileResponse(index_path, media_type="text/html")


@app.get("/api/joycon/list")
async def api_joycon_list() -> Any:
    if list_devices is None:
        raise HTTPException(status_code=500, detail="joycon module not available")
    return list_devices()


@app.get("/api/joycon/poll")
async def api_joycon_poll() -> Any:
    if is_available is None or poll_once is None:
        raise HTTPException(status_code=500, detail="joycon module not available")
    if not is_available():
        return {"available": False, "state": None}
    g = poll_once()
    return {"available": True, "state": g}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
