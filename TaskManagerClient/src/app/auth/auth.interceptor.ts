import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem("auth-token");
    const authReq = token ? request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    }) : request

    console.log('Outgoing request:', authReq);

    return next.handle(authReq).pipe(
      tap(event => {
        console.log('Incoming response:', event);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        return throwError(error);
      })
    );

  }
}