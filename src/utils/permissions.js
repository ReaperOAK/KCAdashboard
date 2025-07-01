// Permission constants (frozen for immutability)
export const PERMISSIONS = Object.freeze({
  USER_MANAGEMENT: Object.freeze({
    VIEW: 'user.view',
    CREATE: 'user.create',
    EDIT: 'user.edit',
    DELETE: 'user.delete',
    MANAGE_PERMISSIONS: 'user.manage_permissions',
  }),
  BATCH_MANAGEMENT: Object.freeze({
    VIEW: 'batch.view',
    CREATE: 'batch.create',
    EDIT: 'batch.edit',
    DELETE: 'batch.delete',
  }),
});

export default PERMISSIONS;

/**
 * Checks if a user has a specific permission.
 * @param {string[]} userPermissions
 * @param {string} requiredPermission
 * @returns {boolean}
 */
export function checkPermission(userPermissions = [], requiredPermission) {
  if (!Array.isArray(userPermissions) || !requiredPermission) return false;
  return userPermissions.includes(requiredPermission);
}

/**
 * Checks if a user has at least one of the required permissions.
 * @param {string[]} userPermissions
 * @param {string[]} requiredPermissions
 * @returns {boolean}
 */
export function hasAnyPermission(userPermissions = [], requiredPermissions = []) {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Checks if a user has all required permissions.
 * @param {string[]} userPermissions
 * @param {string[]} requiredPermissions
 * @returns {boolean}
 */
export function hasAllPermissions(userPermissions = [], requiredPermissions = []) {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
  return requiredPermissions.every((permission) => userPermissions.includes(permission));
}
