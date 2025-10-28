from fastapi import FastAPI
from fastapi.responses import FileResponse
 
import uvicorn
import os

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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
