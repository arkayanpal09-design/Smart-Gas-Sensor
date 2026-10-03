from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import sensor, device, health

app = FastAPI(title="Smart Gas Mask IoT - Backend API")

# Configure CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(sensor.router, prefix="/api", tags=["sensor"])
app.include_router(device.router, prefix="/api", tags=["device"])

if __name__ == "__main__":
    import uvicorn
    # Listen on 0.0.0.0 so ESP-01 over local Wi-Fi can reach this IP
    uvicorn.run(app, host="0.0.0.0", port=8000)
