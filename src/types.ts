export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

export interface MenuLink {
  id: number;
  label: string;
  href: string;
}

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
}
