export interface metadataItemI {
  index: number;
  url: string;
  title: string;
  description: string;
  image: string;
}

export interface invalidURLI {
  index: number;
  url: string;
  error: string;
}

export interface URLObj {
  id: string;
  url: string;
}
