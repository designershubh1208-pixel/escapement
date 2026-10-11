import logging
from typing import Dict

logger = logging.getLogger("defai.kill_switch")

class KillSwitchManager:
    _instance = None
    _user_switches: Dict[str, bool] = {}
    _global_switch: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(KillSwitchManager, cls).__new__(cls)
        return cls._instance

    def is_active(self, user_id: str = "user_1") -> bool:
        if self._global_switch:
            return True
        return self._user_switches.get(user_id, False)

    def trigger(self, user_id: str = "user_1") -> None:
        self._user_switches[user_id] = True
        logger.warning(f"KILL SWITCH TRIGGERED for user {user_id}. All financial execution stopped.")

    def reset(self, user_id: str = "user_1") -> None:
        self._user_switches[user_id] = False
        logger.info(f"KILL SWITCH RESET for user {user_id}. Normal policy processing resumed.")

    def trigger_global(self) -> None:
        self._global_switch = True
        logger.critical("GLOBAL KILL SWITCH TRIGGERED! System-wide execution halted.")

    def reset_global(self) -> None:
        self._global_switch = False
        logger.info("Global kill switch reset.")

kill_switch = KillSwitchManager()
