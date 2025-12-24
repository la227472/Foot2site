import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { ConnectionService } from './Service/connection.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontEnd';
  showNavbar = true;

  constructor(
    public connectionService: ConnectionService,
    private router: Router
  ) {
    // Masquer la navbar sur les pages de connexion et inscription
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const hideNavbarRoutes = ['/connection', '/insci'];
      this.showNavbar = !hideNavbarRoutes.includes(event.urlAfterRedirects || event.url);
    });
  }
}
