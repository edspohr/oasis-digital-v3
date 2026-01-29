#!/usr/bin/env python3
"""
Quick script to create a test user directly in Supabase.
Run: python scripts/create_test_user.py
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

# Test users to create
TEST_USERS = [
    {
        "email": "admin@oasis.dev",
        "password": "Test123!",
        "full_name": "Platform Admin",
        "is_platform_admin": True,
    },
    {
        "email": "participante@oasis.dev",
        "password": "Test123!",
        "full_name": "Test Participante",
        "is_platform_admin": False,
    },
]

print("🚀 Creating test users directly in Supabase...\n")

for user_data in TEST_USERS:
    try:
        # Create user in auth.users (auto-confirmed)
        response = supabase.auth.admin.create_user({
            "email": user_data["email"],
            "password": user_data["password"],
            "email_confirm": True,  # Auto-confirm
            "user_metadata": {
                "full_name": user_data["full_name"],
            },
        })

        if response.user:
            user_id = response.user.id
            print(f"✅ Created: {user_data['email']} (ID: {user_id[:8]}...)")

            # Update profile if platform admin
            if user_data["is_platform_admin"]:
                supabase.table("profiles").update({
                    "is_platform_admin": True
                }).eq("id", user_id).execute()
                print(f"   🌟 Promoted to Platform Admin")
        else:
            print(f"⚠️  Could not create {user_data['email']}")

    except Exception as e:
        error_msg = str(e)
        if "already been registered" in error_msg.lower() or "already exists" in error_msg.lower():
            print(f"ℹ️  Already exists: {user_data['email']}")
        else:
            print(f"❌ Error creating {user_data['email']}: {e}")

print("\n" + "="*50)
print("📋 Test Credentials:")
print("="*50)
for user_data in TEST_USERS:
    role = "Platform Admin" if user_data["is_platform_admin"] else "Participante"
    print(f"   {user_data['email']} / Test123! ({role})")
print("="*50)
