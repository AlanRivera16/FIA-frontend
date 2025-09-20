export interface Item {
    text: string;
    value: string;
  }

export interface Cliente {
  nombre:string;
  _id:string;
  evidencia_aval: {
    originalname: string;
    url: string;
  }[];
}

export interface Asesor {
  nombre:string;
  _id:string;
}