import { Component, OnInit, inject } from '@angular/core'; // Ajoutez inject
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationComplete } from '../Interface/Configuration';
import { ConfigurationService } from '../Service/configuration.service';
import { ConnectionService } from '../Service/connection.service'; // Importez votre service de connexion
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil-config',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profil-config.component.html',
  styleUrl: './profil-config.component.css'
})
export class ProfilConfigComponent implements OnInit {
  configurations: ConfigurationComplete[] = [];
  expandedConfigId: number | null = null;
  isLoading = true;

  // Injection des services
  private configService = inject(ConfigurationService);
  public authService = inject(ConnectionService);

  ngOnInit(): void {
    this.loadUserConfigs();
  }

  loadUserConfigs(): void {
    this.isLoading = true;
    
    // Récupération de l'utilisateur actuellement connecté via le signal
    const user = this.authService.currentUser();

    if (!user) {
      this.isLoading = false;
      console.warn("Aucun utilisateur connecté.");
      return;
    }

    this.configService.getConfigurationsComplete().subscribe({
      next: (configs) => {
        // FILTRAGE : On garde uniquement les configs appartenant à l'utilisateur connecté
        this.configurations = configs.filter(c => c.utilisateurId === user.id);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleExpand(configId: number | undefined): void {
    if (configId === undefined) return;

    if (this.expandedConfigId === configId) {
      this.expandedConfigId = null; 
    } else {
      this.expandedConfigId = configId;
    }
  }

  getScoreClass(score: number | undefined | null): string {
    if (score === undefined || score === null) return 'score-red';
    if (score < 50) return 'score-red';
    if (score < 70) return 'score-orange';
    return 'score-green';
  }
}