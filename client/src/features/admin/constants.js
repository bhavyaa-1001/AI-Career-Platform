export const ALL_ROLES = ['student', 'recruiter', 'sub_admin', 'admin'];

export const ADMIN_PANEL_ROLES = ['admin', 'sub_admin'];

export const ROLE_LABELS = {
  student: 'Student',
  recruiter: 'Recruiter',
  sub_admin: 'Sub Admin',
  admin: 'Admin',
};

export const ROLE_OPTIONS = ALL_ROLES.map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

export const getAssignableRoleOptions = (isFullAdmin) =>
  (isFullAdmin ? ALL_ROLES : ['student', 'recruiter']).map((value) => ({
    value,
    label: ROLE_LABELS[value],
  }));

export const isFullAdmin = (role) => role === 'admin';
export const isAdminPanelUser = (role) => ADMIN_PANEL_ROLES.includes(role);
