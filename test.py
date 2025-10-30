#!/usr/bin/env python3
import time
import json
from joycon import list_devices, poll_once, is_available

def pretty(o):
    try:
        return json.dumps(o, indent=2, sort_keys=True)
    except Exception:
        return str(o)

def main():
    try:
        print('devices:')
        print(pretty(list_devices()))
    except Exception as e:
        print('list_devices error', e)
    try:
        while True:
            avail = False
            st = None
            try:
                avail = bool(is_available())
            except Exception:
                avail = False
            try:
                st = poll_once()
            except Exception as e:
                st = {'error': str(e)}
            out = {'ts': int(time.time() * 1000), 'available': avail, 'state': st}
            print(pretty(out))
            time.sleep(0.12)
    except KeyboardInterrupt:
        print('exiting')

if __name__ == '__main__':
    main()
