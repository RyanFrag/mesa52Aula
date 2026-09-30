import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

// É um Guarda, serve pra ver se o usuário esta logado enquanto acessa o site
export const authGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();

        if(user){
          resolve(true);
        }else{
          resolve(router.createUrlTree(['/login']));
        }
    })
  });



};
