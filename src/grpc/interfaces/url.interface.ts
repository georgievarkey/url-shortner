export interface CreateUrlRequest {
    longUrl: string;
    expiresAt?: string;
  }
  
  export interface GetUrlRequest {
    shortUrl: string;
  }
  
  export interface UrlResponse {
    shortUrl: string;
    longUrl: string;
    createdAt: string;
    expiresAt?: string;
    clickCount: string;
    isActive: boolean;
  }
  
  export interface DeactivateUrlRequest {
    shortUrl: string;
  }
  
  export interface DeactivateUrlResponse {
    success: boolean;
  }
  