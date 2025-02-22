const PERMISSIONS = {
    USER_MANAGEMENT: {
        VIEW: 'user.view',
        CREATE: 'user.create',
        EDIT: 'user.edit',
        DELETE: 'user.delete',
        MANAGE_PERMISSIONS: 'user.manage_permissions'
    },
    BATCH_MANAGEMENT: {
        VIEW: 'batch.view',
        CREATE: 'batch.create',
        EDIT: 'batch.edit',
        DELETE: 'batch.delete'
    }
};

export const checkPermission = (userPermissions = [], requiredPermission) => {
    if (!userPermissions || !requiredPermission) return false;
    return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions = [], requiredPermissions = []) => {
    if (!userPermissions || !requiredPermissions) return false;
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions = [], requiredPermissions = []) => {
    if (!userPermissions || !requiredPermissions) return false;
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};

export default PERMISSIONS;
