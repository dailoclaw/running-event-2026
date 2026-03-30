"""
Seed script — uploads contacts and segments from seed.json to Supabase.
Run after setting up the database schema (see supabase/README.md).

Usage: python3 scripts/seed-supabase.py
Requires: SUPABASE_SERVICE_KEY in .env.local
"""
import json, urllib.request, os

URL = "https://zcbahisqvbslkjkibagm.supabase.co"

# Read service key from .env.local
env = {}
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
with open(env_path) as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env[k] = v

SERVICE_KEY = env.get('SUPABASE_SERVICE_KEY', '')
if not SERVICE_KEY:
    print("ERROR: SUPABASE_SERVICE_KEY not found in .env.local")
    exit(1)

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal"
}

seed_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'seed.json')
with open(seed_path) as f:
    seed = json.load(f)

def upsert(table, rows, chunk=100):
    total = 0
    for i in range(0, len(rows), chunk):
        batch = rows[i:i+chunk]
        payload = json.dumps(batch).encode()
        req = urllib.request.Request(f"{URL}/rest/v1/{table}", data=payload, headers=HEADERS, method="POST")
        try:
            urllib.request.urlopen(req)
            total += len(batch)
            print(f"  {table}: {total}/{len(rows)}...", end="\r")
        except urllib.error.HTTPError as e:
            print(f"\nError: {e.read().decode()[:200]}")
    print()
    return total

contacts = [{
    "id": c["id"], "organisation": c.get("organisation",""),
    "contact_person": c.get("contactPerson",""), "email": c.get("email",""),
    "phone": c.get("phone",""), "street": c.get("street",""),
    "suburb": c.get("suburb",""), "category": c.get("category",""),
    "sheet": c.get("sheet",""), "date_sent": c.get("dateSent",""),
    "response": c.get("response",""), "email_failed": c.get("emailFailed",""),
    "notes": c.get("notes",""), "drop_status": c.get("dropStatus","pending"),
    "drop_volunteer": c.get("dropVolunteer",""), "drop_date": c.get("dropDate",""),
} for c in seed["contacts"]]

segments = [{
    "id": s["id"], "name": s["name"],
    "main_houses": s.get("mainHouses",0), "main_apts": s.get("mainApts",0),
    "main_business": s.get("mainBusiness",0), "side_houses": s.get("sideHouses",0),
    "side_apts": s.get("sideApts",0), "side_business": s.get("sideBusiness",0),
    "total": s.get("total",0), "assigned_to": s.get("assignedTo",""),
    "status": s.get("status","pending"),
} for s in seed["segments"]]

print(f"Seeding {len(contacts)} contacts...")
print(f"✅ {upsert('contacts', contacts)} contacts seeded")

print(f"Seeding {len(segments)} segments...")
print(f"✅ {upsert('segments', segments)} segments seeded")
