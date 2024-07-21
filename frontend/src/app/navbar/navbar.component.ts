import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  activeUser: any;
  showLogoutButton: boolean = false;
  username: string = '';
  activeTokenCount: number = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.checkUrlForDashboard();
    this.fetchActiveTokenCount(); // Fetch token count on initialization
  }

  checkUrlForDashboard() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showLogoutButton = currentUrl.includes('dashboard');

      // Trigger additional updates if needed
      if (this.showLogoutButton) {
        this.reloadNavbar();
      }
    });
  }

  reloadNavbar() {
    this.loadUsername(); // Reload username or any other relevant data
    this.fetchActiveTokenCount(); // Fetch token count on initialization
  }

  loadUsername() {
    const userId = localStorage.getItem('currentUserId');
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    if (userId && token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<any>(`http://localhost:3000/users/${userId}`, { headers }).subscribe(
        user => {
          this.username = user.username;
          console.log(this.username);
        },
        error => {
          console.error('Error fetching user:', error);
          if (error.status === 403) {
            this.snackBar.open('Access forbidden. Please login again.', 'Close', {
              duration: 3000,
            });
          }
        }
      );
    }
  }

  logout() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post<any>('http://localhost:3000/logout', {}, { headers }).subscribe(
      () => {
        this.fetchActiveTokenCount(); // Fetch token count on initialization
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserId');
        this.cookieService.delete('username');
        this.cookieService.delete('password');
        this.cookieService.delete('rememberMe');
        this.activeUser = null;
        this.router.navigateByUrl('/login');
        this.snackBar.open('Logout successful', 'Close', {
          duration: 3000,
        });
      },
      (error: any) => {
        console.error('Logout error:', error);
        this.snackBar.open('Logout failed. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  fetchActiveTokenCount() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<any>('http://localhost:3000/active-tokens/count', { headers }).subscribe(
        response => {
          this.activeTokenCount = response.count; // Update the count variable
        },
        error => {
          console.error('Error fetching active token count:', error);
        }
      );
    }
  }
}
