import { Component, OnInit, signal } from '@angular/core';
import { CommandeService } from '../Service/commande.service';
import { ConnectionService } from '../Service/connection.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-commandes',
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  commandes: any[] = [];
  isLoading = true;
  expandedOrderId: number | null = null;

  constructor(
    private commandeService: CommandeService,
    private authService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  // Cette fonction découpe la chaîne globale proprement
  splitDetails(fullString: string): string[] {
    if (!fullString) return [];
    // On découpe uniquement quand il y a une virgule suivie d'un espace
    // Cela évite de couper le "649,99€"
    return fullString.split(/,\s+/);
  }

  // Cette fonction extrait le nom et le prix de chaque morceau
  parseComponentDetail(detail: string) {
    if (!detail) return { nom: '', prix: '' };
    
    // On cherche le prix entre parenthèses à la fin de la chaîne
    const regex = /^(.*)\(([^)]+)\)$/;
    const match = detail.trim().match(regex);

    if (match) {
      return {
        nom: match[1].trim(),
        prix: match[2].trim()
      };
    }

    return { nom: detail.trim(), prix: '' };
  }

  loadUserOrders(): void {
    const user = this.authService.currentUser();
    
    // Sécurité au cas où l'utilisateur n'est pas encore chargé
    if (!user) {
      this.isLoading = false;
      return;
    }

    this.commandeService.getCommandes().subscribe({
      next: (data) => {
        // 1. On filtre les commandes appartenant à l'utilisateur connecté
        // 2. On trie par ID décroissant pour avoir les plus récentes en haut
        this.commandes = data
          .filter(c => c.utilisateurId === user.id)
          .sort((a, b) => b.id - a.id);
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes', err);
        this.isLoading = false;
      }
    });
  }

  toggleExpand(id: number): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }
}