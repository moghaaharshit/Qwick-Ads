from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import bcrypt
import jwt
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import cloudinary
import cloudinary.uploader
import firebase_admin
from firebase_admin import credentials, firestore

# ==================== CREDENTIALS FROM ENV VARS ====================
import json

JWT_SECRET = os.environ.get("JWT_SECRET", "qwickads-secret-key-2024-local-dev")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "qwickads@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "QwickAds@2026")

# Cloudinary Config (from env vars)
CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "vvzao50a")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "311298154868821")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "uuczaDz9Fsg-OE_KLF_toxamyuo")

# ==================== INITIALIZE SERVICES ====================
# Initialize Firebase (with fallback for missing credentials)
USE_FIREBASE = False
db = None

try:
    # Try to get Firebase credentials from environment variable (JSON string)
    firebase_cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "")
    
    if firebase_cred_json:
        firebase_cred_dict = json.loads(firebase_cred_json)
        cred = credentials.Certificate(firebase_cred_dict)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        USE_FIREBASE = True
        print("[OK] Firebase initialized successfully!")
    else:
        print("[WARN] FIREBASE_SERVICE_ACCOUNT not set. Using in-memory storage.")
except Exception as e:
    print(f"[WARN] Firebase init failed: {e}. Using in-memory storage.")

# Fallback to in-memory storage if Firebase not available
if not USE_FIREBASE:
    from collections import defaultdict
    db = defaultdict(dict)

# Initialize Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

app = FastAPI(title="QwickAds API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"


# ---------------- Auth utils ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email, "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        email = payload["email"]
        if USE_FIREBASE:
            user_doc = db.collection("users").document(email).get()
            if not user_doc.exists:
                raise HTTPException(status_code=401, detail="User not found")
            user = user_doc.to_dict()
        else:
            # In-memory fallback
            if email not in db["users"]:
                raise HTTPException(status_code=401, detail="User not found")
            user = db["users"][email]
        
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    mobile: str
    company: Optional[str] = ""
    city: Optional[str] = ""
    budget: Optional[str] = ""
    requirement: Optional[str] = ""
    source: Optional[str] = "website"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeadCreate(BaseModel):
    name: str
    mobile: str
    company: Optional[str] = ""
    city: Optional[str] = ""
    budget: Optional[str] = ""
    requirement: Optional[str] = ""
    source: Optional[str] = "website"


class LoginInput(BaseModel):
    email: str
    password: str


class HeroSlide(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "image"
    media: str = ""
    title: Optional[str] = ""
    caption: Optional[str] = ""
    order: int = 0


class ShowcaseItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image: str = ""
    tag: str = ""
    title: str = ""
    order: int = 0


class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    role: str = ""
    city: str = ""
    quote: str = ""
    order: int = 0


class Stat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    value: int = 0
    suffix: str = ""
    label: str = ""
    order: int = 0


COLLECTIONS = {
    "hero-slides": ("hero_slides", HeroSlide),
    "showcase": ("showcase_items", ShowcaseItem),
    "testimonials": ("testimonials", Testimonial),
    "stats": ("stats", Stat),
}


# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(payload: LoginInput):
    email = payload.email.strip().lower()
    
    if USE_FIREBASE:
        user_doc = db.collection("users").document(email).get()
        if not user_doc.exists:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user = user_doc.to_dict()
    else:
        # In-memory fallback
        if email not in db["users"]:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user = db["users"][email]
    
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(email, email)
    return {"access_token": token, "user": {"email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return {"email": admin["email"], "name": admin.get("name", "Admin"), "role": admin.get("role", "admin")}


# ---------------- Public content routes ----------------
@api_router.get("/")
async def root():
    return {"message": "QwickAds API is live"}


@api_router.get("/content/{kind}")
async def get_content(kind: str):
    if kind not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown content type")
    
    coll_name, _ = COLLECTIONS[kind]
    
    if USE_FIREBASE:
        docs = db.collection(coll_name).order_by("order").stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]
    else:
        # In-memory fallback
        items = list(db.get(coll_name, {}).values())
        items.sort(key=lambda x: x.get("order", 0))
        return items


# ---------------- Admin CRUD routes ----------------
@api_router.post("/admin/{kind}")
async def admin_create(kind: str, body: dict, admin: dict = Depends(get_current_admin)):
    if kind not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown content type")
    
    coll_name, model = COLLECTIONS[kind]
    obj = model(**body)
    
    if USE_FIREBASE:
        doc_ref = db.collection(coll_name).document(obj.id)
        doc_ref.set(obj.model_dump())
    else:
        # In-memory fallback
        if coll_name not in db:
            db[coll_name] = {}
        db[coll_name][obj.id] = obj.model_dump()
    
    return obj.model_dump()


@api_router.put("/admin/{kind}/{item_id}")
async def admin_update(kind: str, item_id: str, body: dict, admin: dict = Depends(get_current_admin)):
    if kind not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown content type")
    
    coll_name, model = COLLECTIONS[kind]
    
    if USE_FIREBASE:
        doc_ref = db.collection(coll_name).document(item_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Item not found")
        existing = doc.to_dict()
    else:
        # In-memory fallback
        if coll_name not in db or item_id not in db[coll_name]:
            raise HTTPException(status_code=404, detail="Item not found")
        existing = db[coll_name][item_id]
    
    body.pop("id", None)
    merged = {**existing, **body}
    obj = model(**merged)
    
    if USE_FIREBASE:
        doc_ref.set(obj.model_dump())
    else:
        db[coll_name][item_id] = obj.model_dump()
    
    return obj.model_dump()


@api_router.delete("/admin/{kind}/{item_id}")
async def admin_delete(kind: str, item_id: str, admin: dict = Depends(get_current_admin)):
    if kind not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown content type")
    
    coll_name, _ = COLLECTIONS[kind]
    
    if USE_FIREBASE:
        doc_ref = db.collection(coll_name).document(item_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Item not found")
        doc_ref.delete()
    else:
        # In-memory fallback
        if coll_name not in db or item_id not in db[coll_name]:
            raise HTTPException(status_code=404, detail="Item not found")
        del db[coll_name][item_id]
    
    return {"ok": True}


@api_router.get("/admin/leads", response_model=List[Lead])
async def admin_list_leads(admin: dict = Depends(get_current_admin)):
    if USE_FIREBASE:
        docs = db.collection("leads").order_by("created_at", direction=firestore.Query.DESCENDING).limit(1000).stream()
        return [Lead(**{**doc.to_dict(), "id": doc.id}) for doc in docs]
    else:
        # In-memory fallback
        leads = list(db.get("leads", {}).values())
        leads.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return [Lead(**lead) for lead in leads[:1000]]


# ---------------- Lead routes ----------------
@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    if not payload.name.strip() or not payload.mobile.strip():
        raise HTTPException(status_code=400, detail="Name and mobile are required")
    
    lead = Lead(**payload.model_dump())
    
    if USE_FIREBASE:
        db.collection("leads").document(lead.id).set(lead.model_dump())
    else:
        # In-memory fallback
        if "leads" not in db:
            db["leads"] = {}
        db["leads"][lead.id] = lead.model_dump()
    
    logger.info("New lead: %s (%s)", lead.name, lead.mobile)
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads():
    if USE_FIREBASE:
        docs = db.collection("leads").order_by("created_at", direction=firestore.Query.DESCENDING).limit(1000).stream()
        return [Lead(**{**doc.to_dict(), "id": doc.id}) for doc in docs]
    else:
        # In-memory fallback
        leads = list(db.get("leads", {}).values())
        leads.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return [Lead(**lead) for lead in leads[:1000]]


@api_router.get("/stats")
async def get_stats():
    return {"active_screens": 100, "daily_reach": 25000, "cities": 3,
            "monthly_impressions": 7000000, "completion_rate": 95}


# ---------------- Settings routes (single-doc key/value) ----------------
@api_router.get("/settings/{key}")
async def get_setting(key: str):
    if USE_FIREBASE:
        doc = db.collection("settings").document(key).get()
        if not doc.exists:
            return {"key": key, "value": ""}
        return {"key": key, **doc.to_dict()}
    else:
        val = db.get("settings", {}).get(key, {"key": key, "value": ""})
        return val


@api_router.put("/settings/{key}")
async def update_setting(key: str, body: dict, admin: dict = Depends(get_current_admin)):
    value = body.get("value", "")
    data = {"key": key, "value": value}
    if USE_FIREBASE:
        db.collection("settings").document(key).set(data)
    else:
        if "settings" not in db:
            db["settings"] = {}
        db["settings"][key] = data
    return data


# ---------------- Cloudinary Upload Route ----------------
@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="qwickads",
            resource_type="auto"
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        logger.error("Upload failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Upload failed")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Seeding ----------------
async def seed_admin():
    email = ADMIN_EMAIL.strip().lower()
    password = ADMIN_PASSWORD
    
    if USE_FIREBASE:
        user_doc = db.collection("users").document(email).get()
        if not user_doc.exists:
            db.collection("users").document(email).set({
                "email": email,
                "password_hash": hash_password(password),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Seeded admin user %s", email)
        else:
            user = user_doc.to_dict()
            if not verify_password(password, user["password_hash"]):
                db.collection("users").document(email).update({
                    "password_hash": hash_password(password)
                })
                logger.info("Updated admin password for %s", email)
    else:
        # In-memory fallback
        if "users" not in db:
            db["users"] = {}
        if email not in db["users"]:
            db["users"][email] = {
                "email": email,
                "password_hash": hash_password(password),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            logger.info("Seeded admin user %s (in-memory)", email)


async def seed_content():
    # Seed hero slides
    if USE_FIREBASE:
        hero_ref = db.collection("hero_slides")
        if len(list(hero_ref.limit(1).stream())) == 0:
            slides = [
                HeroSlide(type="image", media="/generated/hero.png", title="Mumbai Nights", caption="Your brand on every street", order=0),
                HeroSlide(type="image", media="/generated/cab_pov.png", title="Passenger View", caption="Ads that ride along", order=1),
                HeroSlide(type="image", media="/generated/video_still.png", title="City Scale", caption="7M+ monthly impressions", order=2),
            ]
            for s in slides:
                hero_ref.document(s.id).set(s.model_dump())
        
        showcase_ref = db.collection("showcase_items")
        if len(list(showcase_ref.limit(1).stream())) == 0:
            items = [
                ShowcaseItem(image="/generated/cab_pov.png", tag="Restaurant", title="Gourmet dining, mid-commute", order=0),
                ShowcaseItem(image="/generated/showcase_hotel.png", tag="Hospitality", title="5-star hotels in the back seat", order=1),
                ShowcaseItem(image="/generated/showcase_jewellery.png", tag="Luxury Retail", title="Jewellery that catches the eye", order=2),
                ShowcaseItem(image="/generated/showcase_realestate.png", tag="Real Estate", title="Skyline homes on every ride", order=3),
            ]
            for item in items:
                showcase_ref.document(item.id).set(item.model_dump())
        
        test_ref = db.collection("testimonials")
        if len(list(test_ref.limit(1).stream())) == 0:
            t = [
                Testimonial(name="Rohan Mehta", role="Owner, The Grand Vista Hotel", city="Mumbai", quote="Our weekend occupancy jumped noticeably after we started running QwickAds across the airport route cabs.", order=0),
                Testimonial(name="Anjali Rao", role="Founder, Saffron Kitchen", city="Pune", quote="People walk in saying they saw us in a cab. It's the cheapest, most effective reach we've ever bought.", order=1),
                Testimonial(name="Vikram Shah", role="Director, Skyline Realty", city="Thane", quote="We sold two flats directly from cab-screen leads. The targeting by locality is genuinely powerful.", order=2),
                Testimonial(name="Dr. Neha Kulkarni", role="MD, CityCare Hospital", city="Mumbai", quote="Our new cardiology wing filled its first-month slots faster than any campaign we've run before.", order=3),
            ]
            for x in t:
                test_ref.document(x.id).set(x.model_dump())
        
        stats_ref = db.collection("stats")
        if len(list(stats_ref.limit(1).stream())) == 0:
            s = [
                Stat(value=100, suffix="+", label="Active Screens", order=0),
                Stat(value=25000, suffix="+", label="Daily Reach", order=1),
                Stat(value=3, suffix="", label="Cities", order=2),
                Stat(value=7, suffix="M+", label="Monthly Impressions", order=3),
                Stat(value=95, suffix="%", label="Ad Completion Rate", order=4),
            ]
            for x in s:
                stats_ref.document(x.id).set(x.model_dump())
    else:
        # In-memory fallback
        if "hero_slides" not in db:
            db["hero_slides"] = {}
        if len(db["hero_slides"]) == 0:
            slides = [
                HeroSlide(type="image", media="/generated/hero.png", title="Mumbai Nights", caption="Your brand on every street", order=0),
                HeroSlide(type="image", media="/generated/cab_pov.png", title="Passenger View", caption="Ads that ride along", order=1),
                HeroSlide(type="image", media="/generated/video_still.png", title="City Scale", caption="7M+ monthly impressions", order=2),
            ]
            for s in slides:
                db["hero_slides"][s.id] = s.model_dump()
        
        if "showcase_items" not in db:
            db["showcase_items"] = {}
        if len(db["showcase_items"]) == 0:
            items = [
                ShowcaseItem(image="/generated/cab_pov.png", tag="Restaurant", title="Gourmet dining, mid-commute", order=0),
                ShowcaseItem(image="/generated/showcase_hotel.png", tag="Hospitality", title="5-star hotels in the back seat", order=1),
                ShowcaseItem(image="/generated/showcase_jewellery.png", tag="Luxury Retail", title="Jewellery that catches the eye", order=2),
                ShowcaseItem(image="/generated/showcase_realestate.png", tag="Real Estate", title="Skyline homes on every ride", order=3),
            ]
            for item in items:
                db["showcase_items"][item.id] = item.model_dump()
        
        if "testimonials" not in db:
            db["testimonials"] = {}
        if len(db["testimonials"]) == 0:
            t = [
                Testimonial(name="Rohan Mehta", role="Owner, The Grand Vista Hotel", city="Mumbai", quote="Our weekend occupancy jumped noticeably after we started running QwickAds across the airport route cabs.", order=0),
                Testimonial(name="Anjali Rao", role="Founder, Saffron Kitchen", city="Pune", quote="People walk in saying they saw us in a cab. It's the cheapest, most effective reach we've ever bought.", order=1),
                Testimonial(name="Vikram Shah", role="Director, Skyline Realty", city="Thane", quote="We sold two flats directly from cab-screen leads. The targeting by locality is genuinely powerful.", order=2),
                Testimonial(name="Dr. Neha Kulkarni", role="MD, CityCare Hospital", city="Mumbai", quote="Our new cardiology wing filled its first-month slots faster than any campaign we've run before.", order=3),
            ]
            for x in t:
                db["testimonials"][x.id] = x.model_dump()
        
        if "stats" not in db:
            db["stats"] = {}
        if len(db["stats"]) == 0:
            s = [
                Stat(value=100, suffix="+", label="Active Screens", order=0),
                Stat(value=25000, suffix="+", label="Daily Reach", order=1),
                Stat(value=3, suffix="", label="Cities", order=2),
                Stat(value=7, suffix="M+", label="Monthly Impressions", order=3),
                Stat(value=95, suffix="%", label="Ad Completion Rate", order=4),
            ]
            for x in s:
                db["stats"][x.id] = x.model_dump()


@app.on_event("startup")
async def startup():
    await seed_admin()
    await seed_content()
    mode = "Firebase + Cloudinary" if USE_FIREBASE else "In-Memory (Firebase credentials not set)"
    logger.info("[OK] QwickAds API started successfully (%s)", mode)


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down QwickAds API")
