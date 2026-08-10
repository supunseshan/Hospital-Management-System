"""
Creates the FIRST administrator account for the Hospital Management System.

Every other staff account is created afterwards from inside the app
(User Accounts screen, admin-only) which calls POST /auth/register-staff.
But that endpoint requires an admin to already be signed in - so this
script exists purely to create that first admin account, directly with
the Firebase Admin SDK, before the app has any users at all.

Usage (from the backend/ directory, with your virtualenv activated and
firebase-service-account.json in place):

    python scripts/create_admin.py \
        --name "Hospital Admin" \
        --email admin@example.com \
        --password "ChangeMe123!"
"""
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.firebase import init_firebase, get_auth, get_db  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Create the first admin account")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    init_firebase()

    user = get_auth().create_user(
        email=args.email,
        password=args.password,
        display_name=args.name,
    )

    get_db().collection("users").document(user.uid).set({
        "id": user.uid,
        "name": args.name,
        "email": args.email,
        "role": "admin",
    })

    print(f"Admin account created. uid={user.uid} email={args.email}")
    print("You can now sign in from the React app with this email/password.")


if __name__ == "__main__":
    main()
