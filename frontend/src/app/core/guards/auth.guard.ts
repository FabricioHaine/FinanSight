import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Protege as rotas privadas da aplicação. A autorizacao real permanece no
 * back-end: este guard apenas evita exibir telas sem sessão ativa.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

/** Impede que usuários autenticados voltem para a tela de login. */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
