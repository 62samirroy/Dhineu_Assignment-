import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
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

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadActiveUser();
    this.checkUrlForDashboard();
  }

  loadActiveUser() {
    this.http.get<any>('http://localhost:3000/active-user').subscribe(
      (data: any) => {
        this.activeUser = data;
      },
      (error: any) => {
        console.error('Error loading active user:', error);
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
        this.activeUser = null; // Clear the active user
        this.router.navigateByUrl('/login'); // Redirect to login page
        console.log('Logout successful');
      },
      (error: any) => {
        console.error('Logout error:', error);
      }
    );
  }
}
