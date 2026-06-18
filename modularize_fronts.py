import os
import glob
import re

front_modules = glob.glob('front_modulo_*')

for module in front_modules:
    components_dir = os.path.join(module, 'src', 'components')
    app_jsx_path = os.path.join(module, 'src', 'App.jsx')

    if not os.path.exists(app_jsx_path):
        continue

    # 1. Create index.js in components
    components = []
    if os.path.exists(components_dir):
        jsx_files = glob.glob(os.path.join(components_dir, '*.jsx'))
        if jsx_files:
            index_content = []
            for jsx in jsx_files:
                basename = os.path.basename(jsx)
                comp_name = basename[:-4]
                index_content.append(f"export {{ default as {comp_name} }} from './{comp_name}';")
                components.append(comp_name)
            
            with open(os.path.join(components_dir, 'index.js'), 'w') as f:
                f.write('\n'.join(index_content) + '\n')

    # 2. Update App.jsx imports
    with open(app_jsx_path, 'r') as f:
        content = f.read()

    # Find internal component imports
    # format: import CompName from './components/CompName';
    comp_imports = re.findall(r"import\s+(\w+)\s+from\s+['\"]\.?/components/\w+['\"];", content)
    
    if comp_imports:
        # Remove old component imports
        content = re.sub(r"import\s+\w+\s+from\s+['\"]\.?/components/\w+['\"];\n?", "", content)
        # Add new grouped import
        grouped_import = f"import {{ {', '.join(comp_imports)} }} from './components';\n"
        
        # Insert after react import or at top
        if "import React" in content or "import { " in content:
            # find the first import and add it after
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i + 1, grouped_import.strip())
                    break
            content = '\n'.join(lines)
        else:
            content = grouped_import + content

    # Find shared_components imports
    shared_imports_default = re.findall(r"import\s+(\w+)\s+from\s+['\"].*?shared_components/\w+['\"];", content)
    shared_imports_named = re.findall(r"import\s+\{([^}]+)\}\s+from\s+['\"].*?shared_components/\w+['\"];", content)
    
    shared_entities = set(shared_imports_default)
    for named in shared_imports_named:
        shared_entities.update([x.strip() for x in named.split(',') if x.strip()])

    if shared_entities:
        # Remove old shared imports
        content = re.sub(r"import\s+\w+\s+from\s+['\"].*?shared_components/\w+['\"];\n?", "", content)
        content = re.sub(r"import\s+\{([^}]+)\}\s+from\s+['\"].*?shared_components/\w+['\"];\n?", "", content)
        
        grouped_shared = f"import {{ {', '.join(shared_entities)} }} from '../../../shared_components';\n"
        
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('import ') and './components' in line:
                lines.insert(i + 1, grouped_shared.strip())
                break
        else:
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i + 1, grouped_shared.strip())
                    break
        content = '\n'.join(lines)

    # Clean up double newlines at top
    content = re.sub(r"^(import[^\n]+\n)+(?:\n)+", lambda m: m.group(0).replace('\n\n', '\n') + '\n', content, 1)

    with open(app_jsx_path, 'w') as f:
        f.write(content)
