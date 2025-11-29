import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept API requests
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  // Get token from localStorage or sessionStorage
  // Check all possible token storage keys
  const possibleKeys = ['token', 'authToken', 'accessToken', 'jwt', 'apiKey', 'auth_token'];
  let token: string | null = null;
  let tokenKey: string | null = null;

  // Check localStorage first
  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      token = value;
      tokenKey = key;
      break;
    }
  }

  // If not found in localStorage, check sessionStorage
  if (!token) {
    for (const key of possibleKeys) {
      const value = sessionStorage.getItem(key);
      if (value) {
        token = value;
        tokenKey = key;
        break;
      }
    }
  }

  // In development mode, if no token is found, try multiple sources
  if (!token && !environment.production) {
    // 1. Try to get token from environment config
    const envToken = (environment as any).authToken;
    if (envToken) {
      token = envToken;
      localStorage.setItem('token', envToken);
      tokenKey = 'token';
    }
    
    // 2. If still no token, try to get token from URL parameters
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token') || urlParams.get('authToken');
      
      if (urlToken) {
        token = urlToken;
        localStorage.setItem('token', urlToken);
        tokenKey = 'token';
      }
    }
  }

  // If token exists, add it to the request headers
  if (token) {
    const cleanToken = token.trim();
    let authHeader: string;
    
    if (cleanToken.startsWith('Bearer ')) {
      authHeader = cleanToken;
    } else if (cleanToken.startsWith('Token ')) {
      authHeader = cleanToken;
    } else {
      authHeader = `Bearer ${cleanToken}`;
    }
    
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });
    
    return next(clonedReq);
  }

  // If no token found, proceed without auth header
  // The backend will return 401 if auth is required, but we let it through
  // so the user can see the actual error from the backend
  return next(req);
};

