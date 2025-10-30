#!/usr/bin/env python3
import time

try:
    from pyjoycon import GyroTrackingJoyCon, get_R_id, get_R_id_list
except Exception:
    GyroTrackingJoyCon = None
    get_R_id = None
    get_R_id_list = None

try:
    import hid
except Exception:
    try:
        import hidapi as hid
    except Exception:
        hid = None

joycon = None
try:
    if GyroTrackingJoyCon is not None and callable(get_R_id):
        joycon_id = get_R_id()
        joycon = GyroTrackingJoyCon(*joycon_id)
    elif GyroTrackingJoyCon is not None and callable(get_R_id_list):
        ids = get_R_id_list()
        if ids:
            joycon = GyroTrackingJoyCon(*ids[0])
except Exception:
    joycon = None


def list_devices():
    if get_R_id_list is None:
        if hid is None:
            return {"right": [], "left": []}
        try:
            devs = hid.enumerate()
        except Exception:
            devs = []
        return {"right": devs, "left": []}
    try:
        r = get_R_id_list()
    except Exception:
        r = []
    return {"right": r, "left": []}


def is_available():
    if joycon is not None:
        return True
    if hid is None:
        return False
    try:
        devs = hid.enumerate()
        return bool(devs)
    except Exception:
        return False


def poll_once():
    if joycon is None:
        return None
    try:
        out = {"pointer": getattr(joycon, 'pointer', None), "rotation": getattr(joycon, 'rotation', None), "direction": getattr(joycon, 'direction', None)}
        status = None
        try:
            status = getattr(joycon, 'status', None)
            if callable(status):
                status = status()
        except Exception:
            status = None
        out['status'] = status
        return out
    except Exception:
        return None


if __name__ == "__main__":
    if GyroTrackingJoyCon is None or get_R_id is None:
        raise SystemExit(1)
    joycon_id = get_R_id()
    joycon = GyroTrackingJoyCon(*joycon_id)
    for i in range(20):
        print("joycon pointer:  ", joycon.pointer)
        print("joycon rotation: ", joycon.rotation)
        print("joycon direction:", joycon.direction)
        print()
        time.sleep(0.05)

