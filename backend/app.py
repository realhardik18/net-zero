import os
from datetime import datetime, timedelta

import bcrypt
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from supabase import create_client, Client

# ───────────────────────────────
# Environment & Supabase client
# ───────────────────────────────
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")
if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE):
    raise RuntimeError("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)



# ───────────────────────────────
# FastAPI instance
# ───────────────────────────────
app = FastAPI(title="Net‑Zero API")
security = HTTPBasic()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:3000"] etc in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ───────────────────────────────
# Helper functions
def get_user_record(email: str):
    """Fetch a single user row by email (or None)."""
    try:
        res = (
            supabase.table("users")
            .select("*")
            .eq("email", email)
            .single()
            .execute()
        )
        return res.data
    except Exception as e:
        # Optionally, print/log e for debugging
        return None



def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_pw(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


async def authed(creds: HTTPBasicCredentials = Depends(security)):
    user = get_user_record(creds.username)
    if not user or not verify_pw(creds.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bad credentials",
        )
    return user  # injected into protected routes

# ───────────────────────────────
# Auth routes
# ───────────────────────────────
@app.post("/register", status_code=201)
def register(payload: dict = Body(...)):
    email = payload.get("email")
    password = payload.get("password")
    name = payload.get("name")
    if not email or not password or not name:
        raise HTTPException(400, "Missing required fields")
    if get_user_record(email):
        raise HTTPException(409, "Email already registered")
    supabase.table("users").insert(
        {
            "email": email,
            "password": hash_pw(password),
            "name": name,
        }
    ).execute()
    return {"msg": "registered"}

@app.post("/login", status_code=200)
def login(payload: dict = Body(...)):
    email = payload.get("email")
    password = payload.get("password")
    user = get_user_record(email)
    if not user or not verify_pw(password, user["password"]):
        raise HTTPException(401, "Bad credentials")
    return {
        "message": "login ok",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
        },
    }



# ───────────────────────────────
# Location CRUD
# ───────────────────────────────
@app.post("/locations", status_code=201)
def create_location(
    latitude: float,
    longitude: float,
):
    loc = (
        supabase.table("locations")
        .insert(
            {
                "latitude": latitude,
                "longitude": longitude,
            }
        )
        .execute()
        .data[0]
    )
    return loc


@app.get("/locations")
def list_locations():
    return supabase.table("locations").select("*").execute().data

# ───────────────────────────────
# Event CRUD
# ───────────────────────────────
@app.post("/events", status_code=201)
def create_event(
    name: str,
    start_time: datetime,
    duration_minutes: int,
    location_id: str,  # UUID as string
    user=Depends(authed),
):
    if duration_minutes <= 0:
        raise HTTPException(422, "duration_minutes must be > 0")

    # confirm location exists (cheap guard)
    loc = (
        supabase.table("locations")
        .select("id")
        .eq("id", location_id)
        .single()
        .execute()
        .data
    )
    if not loc:
        raise HTTPException(404, "Location not found")

    ev = (
        supabase.table("events")
        .insert(
            {
                "host_id": user["id"],
                "name": name,
                "start_time": start_time.isoformat(),
                "duration_minutes": duration_minutes,
                "location_id": location_id,
            }
        )
        .execute()
        .data[0]
    )
    return ev


@app.get("/events")
def list_events():
    return supabase.table("events").select("*").execute().data


@app.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: str, user=Depends(authed)):
    ev = (
        supabase.table("events")
        .select("*")
        .eq("id", event_id)
        .single()
        .execute()
        .data
    )
    if not ev:
        raise HTTPException(404, "Not found")
    if ev["host_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")

    supabase.table("events").delete().eq("id", event_id).execute()
