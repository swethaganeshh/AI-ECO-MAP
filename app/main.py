from fastapi import FastAPI
from app.routes import weather, pollution, route, eco_planner

app = FastAPI(title="Eco-MCP API", version="1.0")

# include routes
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(pollution.router, prefix="/pollution", tags=["Pollution"])
app.include_router(route.router, prefix="/route", tags=["Route"])
app.include_router(eco_planner.router, prefix="/eco", tags=["Eco Planning"])

@app.get("/healthz")
def health_check():
    return {"status": "ok", "message": "Eco-MCP API is running"}
