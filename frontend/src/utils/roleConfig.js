export const ROLE_CONFIG = {
  donor: {
    dashboardPath: '/donor',
    allowedPaths: ['/donor']
  },
  hospital: {
    dashboardPath: '/hospital',
    allowedPaths: ['/hospital']
  },
  admin: {
    dashboardPath: '/admin',
    allowedPaths: ['/admin']
  }
  /* Note: 'patient' role is no longer a self-service portal.
     Patients are records managed under hospital accounts. */
};
