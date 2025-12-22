// src/app/services/configuration.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../Environement/environement';
import { CreateConfigurationRequest } from '../Interface/Configuration';
import { Configuration } from '../Interface/Configuration';
import { Composants } from '../Interface/Composants';
import { ConfigurationComplete } from '../Interface/Configuration';
import {ConfigurationDTO} from '../Interface/ConfigurationDTO';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============== GESTION D'ERREURS ==============

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;

      switch (error.status) {
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous connecter.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 400:
          errorMessage = error.error || 'Requête invalide.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
      }
    }

    console.error('Erreur HTTP:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // ============== COMPOSANTS ==============

  /**
   * Récupère tous les composants
   */
  getAllComposants(): Observable<Composants[]> {
    return this.http.get<Composants[]>(`${this.apiUrl}/Composants`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère un composant par ID
   */
  getComposantById(id: number): Observable<Composants> {
    return this.http.get<Composants>(`${this.apiUrl}/Composants/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Filtre les composants par type
   */
  getComposantsByType(type: Composants['type']): Observable<Composants[]> {
    return this.getAllComposants().pipe(
      map(composants => composants.filter(c => c.type === type))
    );
  }

  /**
   * Filtre les composants par marque
   */
  getComposantsByMarque(marque: string): Observable<Composants[]> {
    return this.getAllComposants().pipe(
      map(composants => composants.filter(c =>
        c.marque.toLowerCase().includes(marque.toLowerCase())
      ))
    );
  }

  /**
   * Récupère uniquement les composants en stock
   */
  getComposantsEnStock(): Observable<Composants[]> {
    return this.getAllComposants().pipe(
      map(composants => composants.filter(c => c.stock > 0))
    );
  }

  /**
   * Crée un nouveau composant (admin uniquement)
   */
  createComposant(composant: Composants, token: string): Observable<Composants> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post<Composants>(`${this.apiUrl}/Composants`, composant, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Met à jour un composant (admin uniquement)
   */
  updateComposant(id: number, composant: Composants, token: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put<void>(`${this.apiUrl}/Composants/${id}`, composant, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Supprime un composant (admin uniquement)
   */
  deleteComposant(id: number, token: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.delete<void>(`${this.apiUrl}/Composants/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // ============== CONFIGURATIONS ==============

  /**
   * Récupère toutes les configurations
   */
  getAllConfigurations(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(`${this.apiUrl}/ConfigurationPc`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère une configuration par ID
   */
  getConfigurationById(id: number): Observable<Configuration> {
    return this.http.get<Configuration>(`${this.apiUrl}/ConfigurationPc/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crée une nouvelle configuration
   */
  createConfiguration(config: CreateConfigurationRequest): Observable<ConfigurationDTO> {
    return this.http.post<ConfigurationDTO>(`${this.apiUrl}/ConfigurationPc`, config)
      .pipe(catchError(this.handleError));
  }

  /**
   * Met à jour une configuration
   */
  updateConfiguration(id: number, config: Configuration): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/ConfigurationPc/${id}`, config)
      .pipe(catchError(this.handleError));
  }

  /**
   * Supprime une configuration
   */
  deleteConfiguration(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ConfigurationPc/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ============== MÉTHODES AVANCÉES ==============

  /**
   * Récupère toutes les configurations avec leurs composants complets
   * Utilise forkJoin pour des appels parallèles optimisés
   */
  getConfigurationsComplete(): Observable<ConfigurationComplete[]> {
    return forkJoin({
      configs: this.getAllConfigurations(),
      composants: this.getAllComposants()
    }).pipe(
      map(({ configs, composants }) => {
        return configs.map(config => this.enrichConfiguration(config, composants));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère une configuration complète par ID
   */
  getConfigurationCompleteById(id: number): Observable<ConfigurationComplete> {
    return forkJoin({
      config: this.getConfigurationById(id),
      composants: this.getAllComposants()
    }).pipe(
      map(({ config, composants }) => this.enrichConfiguration(config, composants)),
      catchError(this.handleError)
    );
  }

  /**
   * Enrichit une configuration avec les composants complets et les calculs
   */
  private enrichConfiguration(config: Configuration, allComposants: Composants[]): ConfigurationComplete {
    const comps = allComposants.filter(c => config.composantIds.includes(c.id));

    return {
      id: config.id,
      nomConfiguration: config.nomConfiguration,
      utilisateurId: config.utilisateurId,
      composantIds: config.composantIds,
      commandeId: config.commandeId,
      composants: comps,
      prixTotal: this.calculerPrixTotal(comps),
      scoreMoyen: this.calculerScoreMoyen(comps)
    };
  }

  /**
   * Récupère les configurations d'un utilisateur spécifique
   */
  getConfigurationsByUserId(userId: number): Observable<ConfigurationComplete[]> {
    return this.getConfigurationsComplete().pipe(
      map(configs => configs.filter(c => c.utilisateurId === userId))
    );
  }

  // ============== MÉTHODES UTILITAIRES ==============

  /**
   * Calcule le prix total d'une liste de composants
   */
  calculerPrixTotal(composants: Composants[]): number {
    return Math.round(composants.reduce((sum, c) => sum + c.prix, 0) * 100) / 100;
  }

  /**
   * Calcule le score moyen d'une liste de composants
   */
  calculerScoreMoyen(composants: Composants[]): number {
    if (composants.length === 0) return 0;
    const sum = composants.reduce((total, c) => total + c.score, 0);
    return Math.round(sum / composants.length);
  }

  /**
   * Vérifie si tous les composants sont en stock
   */
  verifierDisponibilite(config: ConfigurationComplete): boolean {
    return config.composants.length > 0 && config.composants.every(c => c.stock > 0);
  }

  /**
   * Obtient les types de composants manquants
   */
  getComposantsManquants(config: ConfigurationComplete, typesRequis: Composants['type'][]): Composants['type'][] {
    const typesPresents = config.composants.map(c => c.type);
    return typesRequis.filter(type => !typesPresents.includes(type));
  }

  /**
   * Vérifie si une configuration est complète
   */
  isConfigurationComplete(config: ConfigurationComplete, typesRequis: Composants['type'][]): boolean {
    return this.getComposantsManquants(config, typesRequis).length === 0;
  }

  /**
   * Compare deux configurations
   */
  comparerConfigurations(config1: ConfigurationComplete, config2: ConfigurationComplete) {
    const diff = {
      differencePrix: config1.prixTotal - config2.prixTotal,
      differenceScore: config1.scoreMoyen - config2.scoreMoyen,
      meilleurPrix: config1.prixTotal < config2.prixTotal ? config1 : config2,
      meilleurScore: config1.scoreMoyen > config2.scoreMoyen ? config1 : config2,
      meilleurRapportQualitePrix: this.calculerRapportQualitePrix(config1) >
                                   this.calculerRapportQualitePrix(config2) ? config1 : config2
    };

    return diff;
  }

  /**
   * Calcule le rapport qualité/prix (score/prix)
   */
  private calculerRapportQualitePrix(config: ConfigurationComplete): number {
    if (config.prixTotal === 0) return 0;
    return config.scoreMoyen / config.prixTotal;
  }

  /**
   * Obtient des statistiques sur les composants
   */
  getStatistiques(): Observable<{
    totalComposants: number;
    composantsEnStock: number;
    prixMoyen: number;
    scoreMoyen: number;
    parType: { [key: string]: number };
  }> {
    return this.getAllComposants().pipe(
      map(composants => {
        const enStock = composants.filter(c => c.stock > 0).length;
        const prixMoyen = composants.length > 0
          ? composants.reduce((sum, c) => sum + c.prix, 0) / composants.length
          : 0;
        const scoreMoyen = composants.length > 0
          ? composants.reduce((sum, c) => sum + c.score, 0) / composants.length
          : 0;

        const parType: { [key: string]: number } = {};
        composants.forEach(c => {
          parType[c.type] = (parType[c.type] || 0) + 1;
        });

        return {
          totalComposants: composants.length,
          composantsEnStock: enStock,
          prixMoyen: Math.round(prixMoyen * 100) / 100,
          scoreMoyen: Math.round(scoreMoyen),
          parType
        };
      })
    );
  }
}
