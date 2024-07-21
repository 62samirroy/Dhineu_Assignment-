import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {
    this.loadRememberedCredentials();
  }

  loadRememberedCredentials() {
    if (this.cookieService.check('rememberMe') && this.cookieService.get('rememberMe') === 'true') {
      this.username = this.cookieService.get('username') || '';
      this.password = this.cookieService.get('password') || '';
      this.rememberMe = true;
    }
  }

  onSubmit() {
    const user = {
      username: this.username,
      password: this.password,
      rememberMe: this.rememberMe
    };

    this.http.post('http://localhost:3000/login', user).subscribe(
      (response: any) => {
        console.log(response);
        this.snackBar.open(response.message, 'Close', {
          duration: 3000, // Snackbar duration
        });
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          sessionStorage.setItem('authToken', response.token);
          localStorage.setItem('currentUserId', response.userId);

          if (this.rememberMe) {
            this.cookieService.set('username', this.username, 7); // Store for 7 days
            this.cookieService.set('password', this.password, 7); // Store for 7 days
            this.cookieService.set('rememberMe', 'true', 7); // Store for 7 days
          } else {
            this.cookieService.delete('username');
            this.cookieService.delete('password');
            this.cookieService.delete('rememberMe');
          }

          this.router.navigateByUrl('/dashboard');
        }
      },
      (error) => {
        this.snackBar.open('Invalid credentials', 'Close', {
          duration: 3000, // Snackbar duration
        });
      }
    );
  }

  onRememberMeChange() {
    console.log('Remember Me:', this.rememberMe);
  }
}
