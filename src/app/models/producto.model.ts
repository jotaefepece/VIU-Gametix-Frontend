export interface Producto {
  id_producto: number;
  name: string;
  description?: string;
  website?: string;
  category_id?: number;
  id_compania?: number;
  created_at?: string;
  updated_at?: string;
  // Campos que NO existen en tu JSON actual (los dejamos opcionales)
  imagen?: string;
  precio?: number;
  stock?: number;
  edad_recomendada?: string;
  puntuacion?: number;
}
