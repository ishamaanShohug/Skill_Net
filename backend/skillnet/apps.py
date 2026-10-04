import logging
import os
import sys
import threading
import time
from django.apps import AppConfig

logger = logging.getLogger('skillnet.demo_reset')


class SkillnetConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'skillnet'

    def ready(self):
        from django.conf import settings
        if not getattr(settings, 'DEMO_RESET_ENABLED', False):
            return
        # Only under `runserver`, and only in the actual reloaded worker process —
        # the autoreloader's parent process also calls ready() but has no RUN_MAIN,
        # so without this check dev would start two competing reset loops.
        if 'runserver' not in sys.argv:
            return
        if os.environ.get('RUN_MAIN') != 'true':
            return
        threading.Thread(target=_reset_loop, args=(settings.DEMO_RESET_INTERVAL_SECONDS,), daemon=True).start()


def _reset_loop(interval_seconds):
    from django.core.management import call_command
    while True:
        time.sleep(interval_seconds)
        try:
            call_command('reset_demo')
        except Exception:
            logger.exception('Scheduled demo reset failed; will retry on the next interval.')
