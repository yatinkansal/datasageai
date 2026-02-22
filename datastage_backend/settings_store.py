"""Simple file-based store for user settings (profile + notifications)."""
import json
import os

SETTINGS_PATH = os.path.join(os.path.dirname(__file__), "user_settings.json")

DEFAULTS = {
    "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
    },
    "notifications": {
        "schemaChanges": True,
        "aiInsights": True,
        "dataQualityAlerts": False,
    },
}


def _load():
    if os.path.isfile(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {"profile": DEFAULTS["profile"].copy(), "notifications": DEFAULTS["notifications"].copy()}


def _save(data):
    try:
        os.makedirs(os.path.dirname(SETTINGS_PATH) or ".", exist_ok=True)
        with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except OSError as e:
        raise RuntimeError(f"Could not write settings file: {e}") from e


def get_settings():
    return _load()


def update_profile(first_name=None, last_name=None, email=None):
    data = _load()
    if first_name is not None:
        data["profile"]["firstName"] = first_name
    if last_name is not None:
        data["profile"]["lastName"] = last_name
    if email is not None:
        data["profile"]["email"] = email
    _save(data)
    return data


def update_notifications(schema_changes=None, ai_insights=None, data_quality_alerts=None):
    data = _load()
    if schema_changes is not None:
        data["notifications"]["schemaChanges"] = schema_changes
    if ai_insights is not None:
        data["notifications"]["aiInsights"] = ai_insights
    if data_quality_alerts is not None:
        data["notifications"]["dataQualityAlerts"] = data_quality_alerts
    _save(data)
    return data
