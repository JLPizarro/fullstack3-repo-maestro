#!/usr/bin/env python3
"""
apply_auth.py - Applies the unified auth.py to all modulo_* microservices.
Reads shared_auth.py and copies it to each module's src/utils/auth.py.
"""
import os
import shutil

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
SOURCE = os.path.join(ROOT_DIR, 'shared_auth.py')

MODULES = [
    "modulo_rrhh",
    "modulo_bodega",
    "modulo_facturacion",
    "modulo_prevencion",
    "modulo_administracion",
    "modulo_mantencion",
    "modulo_operacion",
    "modulo_acreditacion",
    "modulo_watchdog",
    "modulo_middleware",
]

def main():
    with open(SOURCE, 'r', encoding='utf-8') as f:
        auth_content = f.read()

    for mod in MODULES:
        utils_dir = os.path.join(ROOT_DIR, mod, 'src', 'utils')
        auth_path = os.path.join(utils_dir, 'auth.py')

        if not os.path.isdir(utils_dir):
            print(f"  [SKIP] {mod}/src/utils/ does not exist")
            continue

        # Backup original
        if os.path.exists(auth_path):
            shutil.copy2(auth_path, auth_path + '.bak')

        with open(auth_path, 'w', encoding='utf-8') as f:
            f.write(auth_content)

        print(f"  [OK] Updated {mod}/src/utils/auth.py")

    print("\nDone. Original files backed up as auth.py.bak")

if __name__ == '__main__':
    main()
