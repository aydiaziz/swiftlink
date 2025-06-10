import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  // Récupère le cookie nommé 'csrftoken'
  getCookie(name: string): string {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return '';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken = this.getCookie('csrftoken');

    // Appliquer uniquement aux requêtes qui modifient les données
    const method = req.method.toUpperCase();
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    let csrfReq = req;

    if (isMutating) {
      csrfReq = req.clone({
        setHeaders: {
          'X-CSRFToken': csrfToken
        },
        withCredentials: true  // nécessaire pour que le cookie soit envoyé aussi
      });
    } else {
      csrfReq = req.clone({
        withCredentials: true
      });
    }

    return next.handle(csrfReq);
  }
}
