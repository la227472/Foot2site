import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comparer-compos',
  standalone: true, // Important en Angular moderne
  imports: [CommonModule, MatIconModule],
  templateUrl: './comparer-compos.component.html',
  styleUrl: './comparer-compos.component.css'
})
export class ComparerComposComponent {
  configGauche = {
    cpu: 'AMD RYZEN 7 9800...',
    price: 529.99,
    score: 85
  };

  configDroite = {
    cpu: 'AMD RYZEN 5 5400...',
    price: 429.99,
    score: 65
  };
}