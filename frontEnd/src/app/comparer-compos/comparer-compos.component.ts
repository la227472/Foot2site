import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationService } from '../Service/configuration.service';

@Component({
  selector: 'app-comparer-compos',
  standalone: true, // Important en Angular moderne
  imports: [CommonModule, MatIconModule],
  templateUrl: './comparer-compos.component.html',
  styleUrl: './comparer-compos.component.css'
})
export class ComparerComposComponent implements OnInit {
  allConfigs: any[] = []; // Liste des ConfigurationPcDto venant du Backend
  configGauche: any = null;
  configDroite: any = null;

  constructor(private configService: ConfigurationService) {}

  ngOnInit() {
    // Appel à votre API .NET
    this.configService.getConfigurations().subscribe(data => {
      this.allConfigs = data;
    });
  }

  // Méthode de sélection
  onSelect(event: any, side: 'gauche' | 'droite') {
    const id = event.target.value;
    const selected = this.allConfigs.find(c => c.id == id);
    if (side === 'gauche') this.configGauche = selected;
    else this.configDroite = selected;
  }

  // Helper pour trouver un composant spécifique par son type dans la liste
  getCompByType(config: any, type: string) {
    return config?.composants?.find((c: any) => c.type === type);
  }

  // Calcul du prix total
  getTotal(config: any): number {
    return config?.composants?.reduce((acc: number, c: any) => acc + c.prix, 0) || 0;
  }

  // Calcul du score moyen
  getAverageScore(config: any): number {
    if (!config?.composants?.length) return 0;
    const sum = config.composants.reduce((acc: number, c: any) => acc + c.score, 0);
    return Math.round(sum / config.composants.length);
  }
}