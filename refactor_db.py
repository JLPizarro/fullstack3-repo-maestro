import os
import re

modules = ["modulo_rrhh", "modulo_mantencion", "modulo_bodega", "modulo_facturacion", "modulo_prevencion", "modulo_administracion"]
base_dir = "/home/vicho/fullstack3"

for mod in modules:
    main_py_path = os.path.join(base_dir, mod, "main.py")
    if not os.path.exists(main_py_path):
        print(f"Skipping {main_py_path}")
        continue
    
    with open(main_py_path, "r") as f:
        content = f.read()
        
    # Replace create_async_engine config
    # Matches: create_async_engine(DATABASE_URL, echo=True) or create_async_engine(DATABASE_URL)
    content = re.sub(
        r'create_async_engine\((DATABASE_URL)(?:,\s*echo=(?:True|False))?\)',
        r'create_async_engine(\1, pool_size=10, max_overflow=20, pool_pre_ping=True, echo=False)',
        content
    )
    
    with open(main_py_path, "w") as f:
        f.write(content)
    print(f"Updated DB config in {mod}/main.py")

