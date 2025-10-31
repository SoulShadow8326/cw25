try:
    import hook
except Exception:
    hook = None

def list_devices():
    if hook is None:
        return {"right": [], "left": []}
    try:
        return hook.list_devices()
    except Exception:
        return {"right": [], "left": []}

def is_available():
    if hook is None:
        return False
    try:
        return bool(hook.is_available())
    except Exception:
        return False

def _button_val(status, side, name):
    try:
        if not status:
            return False
        b = status.get('buttons') or {}
        s = b.get(side) or {}
        v = s.get(name)
        if isinstance(v, dict):
            return bool(v.get('pressed') or v.get('value'))
        return bool(v)
    except Exception:
        return False

def poll_once():
    if hook is None:
        return None
    try:
        raw = hook.poll_once()
    except Exception:
        raw = None
    out = {"available": bool(raw is not None), "raw": raw, "gamepad": None}
    if raw is None:
        return out
    status = raw.get('status') if isinstance(raw, dict) else None
    pointer = raw.get('pointer') if isinstance(raw, dict) else None
    axes = [0.0, 0.0]
    try:
        if pointer and isinstance(pointer, dict):
            x = pointer.get('x')
            y = pointer.get('y')
            axes[0] = float(x) if x is not None else 0.0
            axes[1] = float(y) if y is not None else 0.0
    except Exception:
        axes = [0.0, 0.0]
    btns = []
    mapping = [
        ('right', 'a'),
        ('right', 'b'),
        ('right', 'x'),
        ('right', 'y'),
        ('left', 'l'),
        ('right', 'r'),
        ('left', 'zl'),
        ('right', 'zr'),
        ('left', 'minus'),
        ('right', 'plus'),
        ('left', 'stick'),
        ('right', 'stick'),
        ('left', 'up'),
        ('left', 'down'),
        ('left', 'left'),
        ('left', 'right'),
    ]
    for side, name in mapping:
        pressed = _button_val(status, side, name)
        val = 1.0 if pressed else 0.0
        btns.append({'pressed': pressed, 'value': val, 'name': f"{side}.{name}"})
    gp = {'axes': axes, 'buttons': btns, 'direction': raw.get('direction') if isinstance(raw, dict) else None}
    out['gamepad'] = gp
    return out

if __name__ == '__main__':
    import time
    import json
    print('available', is_available())
    print('devices', list_devices())
    for i in range(10):
        print(json.dumps(poll_once(), indent=2))
        time.sleep(0.12)
