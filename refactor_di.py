import os
import re

modules = ["modulo_rrhh", "modulo_bodega", "modulo_facturacion", "modulo_prevencion", "modulo_administracion", "modulo_mantencion"]
base_dir = "/home/vicho/fullstack3"

for mod in modules:
    main_py_path = os.path.join(base_dir, mod, "main.py")
    if not os.path.exists(main_py_path): continue
    
    with open(main_py_path, "r") as f:
        content = f.read()
    
    # We will use a regex to find all blueprint registrations with type('ServiceProxy', ...)
    pattern = r'(bp_[a-zA-Z0-9_]+|bp)\s*=\s*(create_[a-zA-Z0-9_]+_blueprint)\(type\(\'[^\']+\',\s*\(\),\s*\{([^\}]+)\}\)\(\)\)'
    
    matches = re.finditer(pattern, content)
    new_content = content
    
    for match in matches:
        full_match = match.group(0)
        bp_var = match.group(1)
        create_fn = match.group(2)
        methods_block = match.group(3)
        
        # Replace in main.py
        new_content = new_content.replace(full_match, f"{bp_var} = {create_fn}()")
        
        # Analyze methods_block to find which `g.some_service` is used
        # Example: 'crear_producto': lambda self, data: g.producto_service.crear_producto(data)
        service_name_match = re.search(r'g\.([a-zA-Z0-9_]+)\.', methods_block)
        if not service_name_match:
            continue
        g_service_name = service_name_match.group(1)
        
        # Now find the corresponding controller file. The create_fn is usually in src.controller.<name>
        # Let's search the imports in main.py to find the file
        import_pattern = rf'from src\.controller\.([a-zA-Z0-9_]+) import {create_fn}'
        import_match = re.search(import_pattern, content)
        if not import_match:
            continue
        
        controller_name = import_match.group(1)
        controller_path = os.path.join(base_dir, mod, "src", "controller", f"{controller_name}.py")
        
        if os.path.exists(controller_path):
            with open(controller_path, "r") as cf:
                ctrl_content = cf.read()
            
            # 1. Update def create_...(service): to def create_...():
            ctrl_content = re.sub(rf'def {create_fn}\(service\):', f'def {create_fn}():', ctrl_content)
            
            # 2. Add `g` to from quart import Blueprint, request, jsonify ...
            if ' g' not in ctrl_content and ', g' not in ctrl_content:
                ctrl_content = ctrl_content.replace('from quart import ', 'from quart import g, ')
            
            # 3. Replace `service.` with `g.<service_name>.`
            # But wait, in controllers it's usually `await service.method(...)`
            # Let's replace ` service.` with ` g.{g_service_name}.`
            ctrl_content = ctrl_content.replace(' service.', f' g.{g_service_name}.')
            # Also cover cases like `await service.method` 
            ctrl_content = ctrl_content.replace('(service.', f'(g.{g_service_name}.')
            
            with open(controller_path, "w") as cf:
                cf.write(ctrl_content)
            print(f"Refactored {controller_path}")

    with open(main_py_path, "w") as f:
        f.write(new_content)
    print(f"Refactored {main_py_path}")

