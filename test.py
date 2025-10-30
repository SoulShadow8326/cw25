#!/usr/bin/env python3
import time
import json
try:
    from pyjoycon import GyroTrackingJoyCon, ButtonEventJoyCon, JoyCon, get_R_id
except Exception:
    GyroTrackingJoyCon = None
    ButtonEventJoyCon = None
    JoyCon = None
    get_R_id = None

def pretty(o):
    try:
        return json.dumps(o, indent=2, sort_keys=True)
    except Exception:
        return str(o)

def make_joycon():
    if get_R_id is None:
        return None
    try:
        jid = get_R_id()
    except Exception:
        return None
    cls = None
    if GyroTrackingJoyCon and ButtonEventJoyCon:
        class MyJoyCon(GyroTrackingJoyCon, ButtonEventJoyCon):
            pass
        cls = MyJoyCon
    elif GyroTrackingJoyCon:
        cls = GyroTrackingJoyCon
    elif ButtonEventJoyCon:
        cls = ButtonEventJoyCon
    elif JoyCon:
        cls = JoyCon
    else:
        return None
    try:
        return cls(*jid)
    except Exception:
        try:
            if JoyCon:
                return JoyCon(*jid)
        except Exception:
            return None

def main():
    jc = make_joycon()
    print('joycon:', bool(jc))
    try:
        while True:
            try:
                out = {'ts': int(time.time() * 1000)}
                if jc is None:
                    out['available'] = False
                    print(pretty(out))
                    time.sleep(0.5)
                    continue
                out['available'] = True
                if hasattr(jc, 'get_status'):
                    try:
                        out['status'] = jc.get_status()
                    except Exception:
                        out['status'] = None
                if hasattr(jc, 'pointer') or hasattr(jc, 'rotation') or hasattr(jc, 'direction'):
                    out['pointer'] = getattr(jc, 'pointer', None)
                    out['rotation'] = getattr(jc, 'rotation', None)
                    out['direction'] = getattr(jc, 'direction', None)
                print(pretty(out))
                if hasattr(jc, 'events'):
                    try:
                        for ev in jc.events():
                            print('event:', ev)
                    except Exception:
                        pass
            except KeyboardInterrupt:
                break
            except Exception as e:
                print('error', e)
            time.sleep(0.05)
    except KeyboardInterrupt:
        pass
    print('exiting')

if __name__ == '__main__':
    main()
