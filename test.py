#!/usr/bin/env python3
import time
import json
try:
	import hook
except Exception:
	hook = None

def pretty(o):
	try:
		return json.dumps(o, indent=2, sort_keys=True)
	except Exception:
		return str(o)

def main():
	if hook is None:
		print('hook module not found')
		return
	try:
		print('devices:')
		print(pretty(hook.list_devices()))
	except Exception:
		print('list_devices error')
	try:
		prev_avail = None
		while True:
			try:
				avail = hook.is_available()
			except Exception:
				avail = False
			if prev_avail is None:
				if avail:
					print('joycon detected')
				else:
					print('joycon not detected')
			else:
				if avail and not prev_avail:
					print('joycon connected')
				elif not avail and prev_avail:
					print('joycon disconnected')
			prev_avail = bool(avail)
			try:
				st = hook.poll_once()
			except Exception:
				st = {'error': 'poll error'}
			out = {'ts': int(time.time() * 1000), 'available': bool(avail), 'state': st}
			print(pretty(out))
			time.sleep(0.12)
	except KeyboardInterrupt:
		print('exiting')

if __name__ == '__main__':
	main()
