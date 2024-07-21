import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    HttpClientModule
  ],
  templateUrl: './dashboard-entry.component.html',
  styleUrls: ['./dashboard-entry.component.scss']
})
export class DashboardEntryComponent {
  user: any;

  constructor(
    public dialogRef: MatDialogRef<DashboardEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.user = data.user || { username: '', password: '', fullname: '', mobileno: '', active: false };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');
  }

  onSave() {
    const payload = {
      username: this.user.username,
      password: this.user.password,
      fullname: this.user.fullname,
      mobileno: this.user.mobileno,
      active: this.user.active
    };

    const headers = this.getAuthHeaders();

    if (this.user.id) {
      // Edit user
      this.http.put(`http://localhost:3000/users/${this.user.id}`, payload, { headers }).subscribe(
        () => {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000, // Snackbar duration
          });
          this.dialogRef.close(payload);
        },
        (error) => {
          this.snackBar.open('Failed to update user. Please try again.', 'Close', {
            duration: 3000, // Snackbar duration
          });
        }
      );
    } else {
      // Add user
      this.http.post('http://localhost:3000/users', payload, { headers }).subscribe(
        () => {
          this.snackBar.open('User added successfully!', 'Close', {
            duration: 3000, // Snackbar duration
          });
          this.dialogRef.close(payload);
        },
        (error) => {
          this.snackBar.open('Failed to add user. Please try again.', 'Close', {
            duration: 3000, // Snackbar duration
          });
        }
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
