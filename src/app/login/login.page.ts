import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
  ],
})
export class LoginPage  {

  email = '';
  senha = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  login(){
    this.auth.login(this.email, this.senha).then(
      () => {
        this.router.navigateByUrl('/home');
      }
    )
  }
  entrarComGoogle(){
    this.auth.loginGoogle().then(
      () => {
        this.router.navigateByUrl('/home');
      }
    )
  }
  inParaCadastrar(){
    this.router.navigateByUrl('/cadastro');
  }
  
}
