import { Component } from '@angular/core';
import { ConnectionService} from '../Service/connection.service';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-accueil',
  imports: [FormsModule, RouterLink, MatIconModule],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

  constructor(private connexionService: ConnectionService) {}

  quit(){
    this.connexionService.logout();
  }
}
