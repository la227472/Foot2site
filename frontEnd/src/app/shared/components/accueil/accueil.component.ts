import { Component } from '@angular/core';
import { ConnectionService} from '../core/services/connection.service';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [FormsModule,RouterLink],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

  constructor(private connexionService: ConnectionService) {}

  quit(){
    this.connexionService.logout();
  }
}
