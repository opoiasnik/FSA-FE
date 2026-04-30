import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';

export const isLoggedInGuard: CanActivateFn = async (_, state) => {
  const userService = inject(UserService);

  const user = await userService.tryLogin();
  if (user) {
    return true;
  }

  userService.login(state.url);
  return false;
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

  return router.createUrlTree(['/home']);
};

export const isOwnerGuard: CanActivateFn = async (_, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  const user = await userService.tryLogin();
  if (!user) {
    userService.login(state.url);
    return false;
  }

  if (userService.hasRole('OWNER')) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
