import { ApiError } from '../utils/ApiError.js';

export const ADMIN_PANEL_ROLES = ['admin', 'sub_admin'];
export const PRIVILEGED_ROLES = ['admin', 'sub_admin'];

export const isFullAdmin = (role) => role === 'admin';
export const isAdminPanelUser = (role) => ADMIN_PANEL_ROLES.includes(role);

export const assertCanAssignRole = (actorRole, newRole, targetCurrentRole) => {
  if (PRIVILEGED_ROLES.includes(newRole) && !isFullAdmin(actorRole)) {
    throw new ApiError(403, 'Only full admins can assign admin or sub-admin roles');
  }
  if (PRIVILEGED_ROLES.includes(targetCurrentRole) && !isFullAdmin(actorRole)) {
    throw new ApiError(403, 'Only full admins can modify admin accounts');
  }
};

export const assertCanModifyPrivilegedUser = (actorRole, targetRole) => {
  if (PRIVILEGED_ROLES.includes(targetRole) && !isFullAdmin(actorRole)) {
    throw new ApiError(403, 'Only full admins can perform this action on admin accounts');
  }
};

export const assertFullAdmin = (actorRole) => {
  if (!isFullAdmin(actorRole)) {
    throw new ApiError(403, 'Only full admins can perform this action');
  }
};
