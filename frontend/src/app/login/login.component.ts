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

  constructor(private router: Router, private http: HttpClient, private snackBar: MatSnackBar) { }

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
          if (this.rememberMe) {
            localStorage.setItem('authToken', response.token);
            sessionStorage.setItem('authToken', response.token);
          }
          // Store user ID in localStorage
          localStorage.setItem('currentUserId', response.userId);
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
    // This method can handle additional logic if needed
    // Currently, it logs the state of the checkbox
    console.log('Remember Me:', this.rememberMe);
  }
  
}
