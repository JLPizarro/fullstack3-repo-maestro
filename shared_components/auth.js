export function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const MODULE_PRIORITY = [
  { id: 'rrhh', path: '/rrhh/' },
  { id: 'bodega', path: '/bodega/' },
  { id: 'mantenciones', path: '/mantencion/' },
  { id: 'operacion', path: '/operacion/' },
  { id: 'facturacion', path: '/facturacion/' },
  { id: 'prevencion', path: '/prevencion/' },
  { id: 'acreditacion', path: '/acreditacion/' },
  { id: 'watchdog', path: '/watchdog/' },
  { id: 'administracion', path: '/' },
];

export function getFirstAuthorizedModule(permisos) {
  for (const mod of MODULE_PRIORITY) {
    const nivel = permisos[mod.id] || 'none';
    if (nivel === 'view' || nivel === 'edit') return mod.path;
  }
  return null;
}

export function checkModuleAccess(moduloId, currentPath) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login/';
    return 'none';
  }

  const payload = decodeJWT(token);
  const permisos = payload?.permisos || {};
  const nivel = permisos[moduloId] || 'none';

  if (nivel === 'none') {
    const nextPath = getFirstAuthorizedModule(permisos);
    if (nextPath && nextPath !== currentPath) {
      window.location.href = nextPath;
    } else {
      localStorage.clear();
      window.location.href = '/login/';
    }
    return 'none';
  }

  return nivel;
}
