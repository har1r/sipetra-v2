/**
 * types/next-auth.d.ts
 *
 * Module augmentation for next-auth to formally declare `id` and `role`
 * on Session.user, User, and JWT.
 */

import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
