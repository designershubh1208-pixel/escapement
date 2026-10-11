import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("defai.database")

# Attempt MySQL connection, with fallback if MySQL credentials are pending
engine = None
SessionLocal = None

def get_engine():
    global engine
    if engine is not None:
        return engine
    
    # Try configured DATABASE_URL (MySQL)
    db_url = settings.DATABASE_URL
    if db_url and "YOUR_PASSWORD" not in db_url:
        try:
            test_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_size=10,
                max_overflow=20
            )
            # Test connection
            with test_engine.connect() as conn:
                pass
            logger.info("Successfully connected to MySQL database.")
            engine = test_engine
            return engine
        except Exception as e:
            logger.warning(f"Could not connect to configured MySQL database ({e}). Falling back to {settings.FALLBACK_SQLITE_URL}")
    
    # Fallback to local SQLite while user sets credentials in .env
    engine = create_engine(
        settings.FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False}
    )
    return engine

def get_sessionmaker():
    global SessionLocal
    if SessionLocal is None:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return SessionLocal

Base = declarative_base()

def get_db():
    session_factory = get_sessionmaker()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
