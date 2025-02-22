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
    // Add more permission categories as needed
};

export const checkPermission = (userPermissions, requiredPermission) => {
    return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions, requiredPermissions) => {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};

export default PERMISSIONS;
