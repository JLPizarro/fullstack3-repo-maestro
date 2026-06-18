import os
import re

base_dir = "/home/vicho/fullstack3"
modules = ["modulo_rrhh", "modulo_bodega", "modulo_facturacion", "modulo_prevencion", "modulo_administracion", "modulo_mantencion"]

for mod in modules:
    controllers_dir = os.path.join(base_dir, mod, "src", "controller")
    if not os.path.exists(controllers_dir): continue
    
    for fname in os.listdir(controllers_dir):
        if not fname.endswith(".py"): continue
        fpath = os.path.join(controllers_dir, fname)
        
        with open(fpath, "r") as f:
            content = f.read()
            
        new_content = re.sub(
            r'except Exception as ([a-zA-Z0-9_]+):\s*return jsonify\(\{"error": str\(\1\)\}\), 400',
            r'except ValueError as \1:\n            return jsonify({"error": str(\1)}), 400',
            content
        )
        
        if new_content != content:
            with open(fpath, "w") as f:
                f.write(new_content)
            print(f"Refactored errors in {fpath}")
