import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { canAccess } from '../access/access';
import { UserService } from '../services/user.service';

export const isLoggedInGuard: CanActivateFn = async (_, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  const user = await userService.tryLogin();
  if (user) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const isLoggedInWithToastGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const userService = inject(UserService);
  const messageService = inject(MessageService);

  const user = await userService.tryLogin();
  if (user) {
    return true;
  }

  messageService.add({
    severity: 'warn',
    summary: 'Login required',
    detail: 'Please log in to view listing details.',
    life: 4000
  });

  return router.createUrlTree(['/login']);
};

export const isOwnerGuard: CanActivateFn = async (_, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  const user = await userService.tryLogin();
  if (!user) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  if (user.roles.some(role => canAccess('viewOwnerStudio', role))) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
