export interface Recipe {
    id: string;
    name: string;
    description: string;
    url?: string;
    ingredients: string;
    instructions?: string;
    creator: string;
    imagePath?: string;
  }
  