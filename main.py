from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

app = FastAPI()

ROOT = os.path.dirname(__file__)
DIST = os.path.join(ROOT, "dist") 

if os.path.isdir(DIST):
    app.mount("/static", StaticFiles(directory=DIST), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_path = os.path.join(DIST, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse("<h1>index.html not found</h1>", status_code=404)

@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str):
    candidate = os.path.join(DIST, full_path)
    if os.path.isfile(candidate):
        return FileResponse(candidate)
    index_path = os.path.join(DIST, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse("<h1>Not Found</h1>", status_code=404)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
