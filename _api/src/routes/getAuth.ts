import { getAuth } from '@clerk/express';

export type CanAccessOptions = {
  userId?: string;
  orgIds?: string[];
};
// Protect a route based on authorization status
export const canAccess = (request: any, options?: CanAccessOptions) => {
  const auth = getAuth(request);

  console.log('Checking if user can access ...', { options, auth });

  if (options?.userId) {
    if (auth.userId !== options?.userId) {
      throw new Error('Unauthorized');
    }
  }

  // TODO: Check for org ids

  // Handle if the user is not authorized
  // if (!auth.has({ permission: 'org:admin:testpermission' })) {
  //   return response.status(403).send('Unauthorized');
  // }

  // TODO: Throw error if user is not authorized
  return auth;
};
