from passlib.context import CryptContext
import sys

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("Admin@123")
    print(f"Success: {h}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
