import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserObj } from '../components/sidebar/sidebar.component';

interface User {
  username: string;
  email: string;
  password: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  URL = 'http://127.0.0.1:8000/api/';
  headers = new HttpHeaders().append(
    'x-auth-token',
    localStorage.getItem('token') || ''
  );

  constructor(private http: HttpClient) {}

  allUsers() {
    return this.http
      .get<UserObj>(this.URL + 'users/all', {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  getUser(receiverId: string) {
    const URL = `${this.URL}users/${receiverId}`;
    return this.http
      .get<UserObj>(URL, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  // sendImage(data: any) {
  //   return this.http
  //     .post(this.URL + 'upload/image', data)
  //     .pipe(catchError(this.handleError));
  // }
  sendImage(data: any) {
    let cloudinaryUrl =
      'https://api.cloudinary.com/v1_1/mubasharjaved/image/upload';

    return this.http
      .post(cloudinaryUrl, data)
      .pipe(catchError(this.handleError));
  }

  sendVideo(data: any) {
    return this.http
      .post(this.URL + 'upload/video', data)
      .pipe(catchError(this.handleError));
  }

  sendAudio(data: any) {
    return this.http
      .post(this.URL + 'upload/audio', data)
      .pipe(catchError(this.handleError));
  }

  registerUser(user: User): Observable<any> {
    return this.http
      .post(this.URL + 'users/register', user, {
        observe: 'response' as 'body',
      })
      .pipe(catchError(this.handleError));
  }

  loginUser(data: any) {
    return this.http
      .post(this.URL + 'login/', data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }

  createRoom(data: any) {
    return this.http
      .post(this.URL + 'createRoom', data)
      .pipe(catchError(this.handleError));
  }

  loadMessages(usersData: any) {
    const URL = `${this.URL}messages/${usersData.senderId}/${usersData.receiverId}`;
    return this.http.get(URL).pipe(catchError(this.handleError));
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  getCurrentUser() {
    let user: any = atob(this.getToken().split('.')[1]);
    return JSON.parse(user);
  }

  getToken() {
    return localStorage.getItem('token') || '';
  }
}
