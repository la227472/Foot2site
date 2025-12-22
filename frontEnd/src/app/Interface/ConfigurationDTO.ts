
export interface ConfigurationDTO {
  id?: number;
  nomConfiguration: string;
  utilisateurId: number;
  composantIds: number[];
  commandeId?: number | null;
}
