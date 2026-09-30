import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

// É um Guarda, serve pra ver se o usuário esta logado enquanto acessa o site
export const authGuardGuard: CanActivateFn = (route, state) => {
  // router = Pra descobrir a rota
  // inject = Injetando o serviço nesse Componente / Guard service
  // Checar se o cara está logado ou não:
  const router = inject(Router);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        // está logado? se sim, segue a vida normal
        if(user){
          resolve(true);
        }
        // se não estiver logado, redireciona para a tela de login
        else{
          resolve(router.createUrlTree(['/login']));
        }
    })
  });



};
