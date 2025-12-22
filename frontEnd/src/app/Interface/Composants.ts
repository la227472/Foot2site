export interface Composants{
  id : number,
  type: 'CPU' | 'GPU' | 'Motherboard' | 'Memory' | 'PSU' | 'Box' | 'HardDisk';
  marque : string,
  modele : string,
  prix : number,
  stock : number,
  score : number
}
