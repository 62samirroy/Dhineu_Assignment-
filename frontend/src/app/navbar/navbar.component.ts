import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadActiveUser();
    this.checkUrlForDashboard();
  }

  loadActiveUser() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.http.get<any>('http://localhost:3000/activeUser', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe(
      user => this.activeUser = user,
      error => {
        console.error('Error loading active user:', error);
        if (error.status === 401) {
          // Unauthorized, clear the token and redirect to login
          this.logout();
        }
      }
    );
  }

  checkUrlForDashboard() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showLogoutButton = currentUrl.includes('dashboard');
    });
  }

  logout() {
    this.http.post<any>('http://localhost:3000/logout', {}).subscribe(
      () => {
        // Clear the token from storage
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('authToken');

        // Clear the active user
        this.activeUser = null;

        // Redirect to login page
        this.router.navigateByUrl('/login');
        this.snackBar.open('Logout successful', 'Close', {
          duration: 3000, // Snackbar duration
        });
      },
      (error: any) => {
        console.error('Logout error:', error);
        this.snackBar.open('Logout failed. Please try again.', 'Close', {
          duration: 3000, // Snackbar duration
        });
      }
    );
  }
}
