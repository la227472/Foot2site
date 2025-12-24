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
  // --- PAGINATION ---
  currentPage = 1;
  itemsPerPage = 5;

  // Utilisation d'un getter pour obtenir uniquement les commandes de la page actuelle
  get paginatedCommandes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.commandes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.commandes.length / this.itemsPerPage);
  }

  // Permet de générer un tableau [1, 2, 3...] pour le ngFor des boutons
  get pagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

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
  
  if (!user) {
    this.isLoading = false;
    return;
  }

  this.commandeService.getCommandes().subscribe({
    next: (data) => {
      // 1. Filtrage et tri
      const filteredData = data
        .filter(c => c.utilisateurId === user.id)
        .sort((a, b) => b.id - a.id);

      // 2. On crée une nouvelle instance de tableau [...]
      this.commandes = [...filteredData]; 
      
      this.currentPage = 1; // On s'assure de revenir à la page 1
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des commandes', err);
      this.isLoading = false;
    }
  });
}

  changePage(page: number): void {
    this.currentPage = page;
    this.expandedOrderId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte en haut de la carte
  }

  toggleExpand(id: number): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }
}