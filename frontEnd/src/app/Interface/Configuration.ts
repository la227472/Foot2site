// src/app/models/configuration.model.ts
export interface Configuration {
  id?: number;
  nomConfiguration: string;
  utilisateurId: number;
  composantIds: number[];
  commandeId?: number | null;
}

export interface CreateConfigurationRequest {
  nomConfiguration: string;
  utilisateurId: number;
  composantIds: number[];
}

export interface CreateConfigurationResponse {
  success: boolean;
  message: string;
  configurationId?: number;
}
