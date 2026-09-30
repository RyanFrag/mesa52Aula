import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User
  } from 'firebase/auth';
import { auth} from '../firebase.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  usuarioAtual(): Observable<User | null > {
    return new Observable((observer) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        observer.next(user);
      });
      return unsubscribe;
    })
  }

    cadastrar(email: string, senha: string){
      return createUserWithEmailAndPassword(auth, email, senha);
    }
    login(email: string, senha: string){
      return signInWithEmailAndPassword(auth, email, senha);
    }
    loginGoogle(){
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      })
      return signInWithPopup(auth, provider);
    }

    logout(){
      return signOut(auth);
    }
}
