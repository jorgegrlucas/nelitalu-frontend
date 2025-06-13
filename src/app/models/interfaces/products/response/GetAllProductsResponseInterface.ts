export interface GetAllproductsResponse {
  id: string;
  name: string;
  amount: number;
  description: string;
  price: string;
  category: {
    id: string;
    name: string;
  };
  _id: any;
  thumbnail?: string;
  thumbnail_url?: string;
}
