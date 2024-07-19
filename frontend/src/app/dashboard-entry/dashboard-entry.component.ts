import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatDialogModule, HttpClientModule],
  templateUrl: './dashboard-entry.component.html',
  styleUrls: ['./dashboard-entry.component.scss']
})
export class DashboardEntryComponent {
  user: any;

  constructor(
    public dialogRef: MatDialogRef<DashboardEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    this.user = data.user || { username: '', password: '', fullname: '', mobileno: '', active: false };
  }

  onSave() {
    const payload = {
      username: this.user.username,
      password: this.user.password,
      fullname: this.user.fullname,
      mobileno: this.user.mobileno,
      active: this.user.active
    };

    if (this.user.id) {
      // Edit user
      this.http.put(`http://localhost:3000/users/${this.user.id}`, payload).subscribe(() => {
        this.dialogRef.close(payload);
      });
    } else {
      // Add user
      this.http.post('http://localhost:3000/users', payload).subscribe(() => {
        this.dialogRef.close(payload);
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
