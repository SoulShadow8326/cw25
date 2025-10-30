import os
import time

root = os.path.dirname(__file__)
local_pkg = os.path.join(root, 'joycon-python', 'pyjoycon')
GyroTrackingJoyCon = None
JoyCon = None
get_R_id = None
get_R_id_list = None
if os.path.isdir(local_pkg):
    try:
        import importlib.util
        init_py = os.path.join(local_pkg, '__init__.py')
        if os.path.isfile(init_py):
            spec = importlib.util.spec_from_file_location('local_pyjoycon', init_py)
            local_pyjoycon = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(local_pyjoycon)
            GyroTrackingJoyCon = getattr(local_pyjoycon, 'GyroTrackingJoyCon', None)
            JoyCon = getattr(local_pyjoycon, 'JoyCon', None)
            get_R_id = getattr(local_pyjoycon, 'get_R_id', None)
            get_R_id_list = getattr(local_pyjoycon, 'get_R_id_list', None)
    except Exception:
        GyroTrackingJoyCon = None
        JoyCon = None
        get_R_id = None
        get_R_id_list = None

joy = None
try:
    if GyroTrackingJoyCon is not None and callable(get_R_id):
        jid = get_R_id()
        joy = GyroTrackingJoyCon(*jid)
    elif GyroTrackingJoyCon is not None and callable(get_R_id_list):
        ids = get_R_id_list()
        if ids:
            joy = GyroTrackingJoyCon(*ids[0])
except Exception:
    joy = None

def list_devices():
    if get_R_id_list is None:
        return {"right": [], "left": []}
    try:
        r = get_R_id_list()
    except Exception:
        r = []
    return {"right": r, "left": []}

def is_available():
    return joy is not None

def poll_once():
    if joy is None:
        return None
    try:
        out = {"pointer": getattr(joy, 'pointer', None), "rotation": getattr(joy, 'rotation', None), "direction": getattr(joy, 'direction', None)}
        try:
            status = getattr(joy, 'status', None)
            if callable(status):
                status = status()
        except Exception:
            status = None
        out['status'] = status
        return out
    except Exception:
        return None

if __name__ == '__main__':
    print('available', is_available())
    print('devices', list_devices())
    for i in range(20):
        print(poll_once())
        time.sleep(0.05)
