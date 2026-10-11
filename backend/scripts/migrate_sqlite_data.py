import os
import sys
import sqlite3
import json
from datetime import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import get_sessionmaker
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.financial import Transaction

def migrate_legacy_data():
    legacy_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "node-backend-legacy", "defai.db"))
    if not os.path.exists(legacy_db_path):
        legacy_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "node-backend", "defai.db"))
    if not os.path.exists(legacy_db_path):
        print(f"Legacy database not found at {legacy_db_path}. Skipping data migration.")
        return

    print(f"Reading legacy data from {legacy_db_path}...")
    sqlite_conn = sqlite3.connect(legacy_db_path)
    sqlite_cur = sqlite_conn.cursor()

    from app.database import Base, get_engine
    Base.metadata.create_all(bind=get_engine())

    session_factory = get_sessionmaker()
    db = session_factory()

    try:
        # 1. Ensure default user exists
        user = db.query(User).filter(User.id == "user_1").first()
        if not user:
            user = User(id="user_1", name="Default Sentinel User")
            db.add(user)
            db.commit()

        # 2. Migrate Chat Sessions
        sqlite_cur.execute("SELECT id, title, created_at FROM chat_sessions")
        sessions = sqlite_cur.fetchall()
        for s_id, s_title, s_created in sessions:
            if not db.query(ChatSession).filter(ChatSession.id == s_id).first():
                try:
                    dt = datetime.strptime(s_created, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    dt = datetime.utcnow()
                db.add(ChatSession(id=s_id, user_id="user_1", title=s_title, created_at=dt))
        db.commit()
        print(f"Migrated {len(sessions)} chat sessions.")

        # 3. Migrate Chat Messages
        sqlite_cur.execute("SELECT id, session_id, role, content, intent_json, created_at FROM chat_messages")
        messages = sqlite_cur.fetchall()
        for m_id, s_id, role, content, intent_json, m_created in messages:
            # Check if exists
            if not db.query(ChatMessage).filter(ChatMessage.id == m_id).first():
                try:
                    dt = datetime.strptime(m_created, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    dt = datetime.utcnow()
                db.add(ChatMessage(
                    id=m_id,
                    session_id=s_id,
                    role=role,
                    content=content,
                    intent_json=intent_json,
                    created_at=dt
                ))
        db.commit()
        print(f"Migrated {len(messages)} chat messages.")

        # 4. Migrate Financial Requests to Transactions
        sqlite_cur.execute("SELECT id, session_id, user_message, intent_json, status, created_at FROM financial_requests")
        reqs = sqlite_cur.fetchall()
        for r_id, s_id, user_msg, intent_json, status, r_created in reqs:
            if not db.query(Transaction).filter(Transaction.id == r_id).first():
                try:
                    dt = datetime.strptime(r_created, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    dt = datetime.utcnow()

                merchant, amount_paise, action = "Unknown", None, "PURCHASE"
                if intent_json:
                    try:
                        parsed = json.loads(intent_json)
                        merchant = parsed.get("merchant", "Unknown")
                        amount_paise = parsed.get("amount_paise")
                        action = parsed.get("action", "PURCHASE")
                    except Exception:
                        pass

                db.add(Transaction(
                    id=r_id,
                    idempotency_key=f"legacy-{r_id}",
                    session_id=s_id,
                    user_id="user_1",
                    user_message=user_msg,
                    intent_json=intent_json,
                    action=action,
                    merchant=merchant,
                    amount_paise=amount_paise,
                    currency="INR",
                    status=status,
                    created_at=dt
                ))
        db.commit()
        print(f"Migrated {len(reqs)} financial requests into transactions.")

        print("Data migration completed successfully!")

    finally:
        db.close()
        sqlite_conn.close()

if __name__ == "__main__":
    migrate_legacy_data()
