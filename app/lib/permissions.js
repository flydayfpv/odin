export const hasRole = (user, roleName) => {

  if (!user) return false;

  return user.roles?.some(
    role => role.name === roleName
  );

};

export const hasAnyRole = (
  user,
  roles
) => {

  if (!user) return false;

  return user.roles?.some(
    role => roles.includes(role.name)
  );

};