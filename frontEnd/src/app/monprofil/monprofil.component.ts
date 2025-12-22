import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConnectionService } from '../Service/connection.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './monprofil.component.html',
  styleUrl: './monprofil.component.css'
})
export class ProfilComponent {
  public authService = inject(ConnectionService);
}