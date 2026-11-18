import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonTitle,
    IonToolbar
  ],
})
export class AppComponent {
  constructor(private router: Router, private auth: AuthService) {}

  sair(){
    this.auth.logout().then(() => {
      this.router.navigate(['login']);
    })
  }

}
