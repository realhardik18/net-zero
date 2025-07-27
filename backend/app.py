import os
from datetime import datetime, timedelta

import bcrypt
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from supabase import create_client, Client
from scraper import scrape_webpage

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
    latitude: float = Form(...),
    longitude: float = Form(...),
):
    try:
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
    except Exception as e:
        print(f"Error creating location: {e}")
        raise HTTPException(500, "Failed to create location")


@app.get("/locations")
def list_locations():
    return supabase.table("locations").select("*").execute().data

# ───────────────────────────────
# Event CRUD
# ───────────────────────────────
@app.post("/events", status_code=201)
def create_event(
    name: str = Form(...),
    start_time: str = Form(...),  # Changed to str and will parse manually
    duration_minutes: int = Form(...),
    location_id: str = Form(...),  # UUID as string
    user=Depends(authed),
):
    if duration_minutes <= 0:
        raise HTTPException(422, "duration_minutes must be > 0")

    # Parse the datetime string
    try:
        parsed_start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(422, "Invalid datetime format")

    # confirm location exists (cheap guard)
    try:
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
    except Exception:
        raise HTTPException(404, "Location not found")

    ev = (
        supabase.table("events")
        .insert(
            {
                "host_id": user["id"],
                "name": name,
                "start_time": parsed_start_time.isoformat(),
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


# 1. GET /profile/{user_id}
@app.get("/profile/{user_email}", status_code=200)
def get_profile_by_id(user_email: str, password: str):
    """
    ?password=plain‑text‑password  (simple for hackathon only)
    """
    user = supabase.table("users").select("*").eq("email", user_email).single().execute().data
    if not user or not verify_pw(password, user["password"]):
        raise HTTPException(401, "Bad credentials")
    user.pop("password", None)
    return user

# 2. POST /profile/{user_id}/update
@app.post("/profile/{user_email}/update", status_code=200)
def update_profile_by_id(user_email: str, payload: dict = Body(...)):
    user = supabase.table("users").select("*").eq("email", user_email).single().execute().data

    allowed = {"name", "x", "github", "linkedin", "avatar_link", "bio"}
    update_data = {k: v for k, v in payload.items() if k in allowed and v is not None}
    if not update_data:
        raise HTTPException(400, "No fields to update")

    supabase.table("users").update(update_data).eq("email", user_email).execute()
    return {"msg": "Profile updated"}

@app.post("/events/{event_id}/join", status_code=201)
def join_event(event_id: str, user=Depends(authed)):
    # Check if event exists
    ev = (
        supabase.table("events")
        .select("*")
        .eq("id", event_id)
        .single()
        .execute()
        .data
    )
    if not ev:
        raise HTTPException(404, "Event not found")
    
    # Check if already a member
    existing = (
        supabase.table("event_members")
        .select("*")
        .eq("event_id", event_id)
        .eq("member_id", user["id"])
        .execute()
        .data
    )
    if existing:
        raise HTTPException(409, "Already a member")
    
    member = (
        supabase.table("event_members")
        .insert({
            "event_id": event_id,
            "member_id": user["id"]
        })
        .execute()
        .data[0]
    )
    return member

@app.delete("/events/{event_id}/leave", status_code=204)
def leave_event(event_id: str, user=Depends(authed)):
    supabase.table("event_members").delete().eq("event_id", event_id).eq("member_id", user["id"]).execute()

@app.get("/events/{event_id}/members")
def get_event_members(event_id: str, user=Depends(authed)):
    # Get event details with location
    event = (
        supabase.table("events")
        .select("*, locations(*)")
        .eq("id", event_id)
        .single()
        .execute()
        .data
    )
    if not event:
        raise HTTPException(404, "Event not found")
    
    # Get members
    members = (
        supabase.table("event_members")
        .select("*, users(id, name, email, bio, linkedin, x, github, avatar_link)")
        .eq("event_id", event_id)
        .execute()
        .data
    )
    
    return {
        "event": event,
        "members": members
    }

@app.get("/my-events")
def get_my_events(user=Depends(authed)):
    """Get events where user is host or member"""
    # Events where user is host
    hosted = (
        supabase.table("events")
        .select("*, locations(*)")
        .eq("host_id", user["id"])
        .execute()
        .data
    )
    # Add attendees_count to each event
    for ev in hosted:
        ev['attendees_count'] = (
            supabase.table("event_members")
            .select("count", count="exact")
            .eq("event_id", ev["id"])
            .execute()
            .count or 0
        )

    # Events where user is member
    memberships = (
        supabase.table("event_members")
        .select("*, events(*, locations(*))")
        .eq("member_id", user["id"])
        .execute()
        .data
    )
    member_events = [m["events"] for m in memberships]

    return {
        "hosted": hosted,
        "member_of": member_events
    }

@app.get("/scrape-luma")
def scrape_luma_event(event_url: str):
    """Scrape a Luma event URL and return event data"""
    # Add https:// if not present
    if not event_url.startswith(('http://', 'https://')):
        event_url = 'https://' + event_url
    
    try:
        event_data = scrape_webpage(event_url)
        return event_data
    except Exception as e:
        raise HTTPException(500, f"Failed to scrape event: {str(e)}")
    
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
