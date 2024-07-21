import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule, HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DashboardEntryComponent } from '../dashboard-entry/dashboard-entry.component';
import { PaginationChangedEvent } from 'ag-grid-community';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  searchValue: string = '';
  rowData: any[] = [];
  columnDefs = [
    { headerName: 'SL No', field: 'slno' },
    { headerName: 'User Name', field: 'username' },
    { headerName: 'Full Name', field: 'fullname' },
    { headerName: 'Mobile No', field: 'mobileno' },
    { headerName: 'Action', field: 'action', cellRenderer: this.actionCellRenderer.bind(this) }
  ];
  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100
  };
  paginationPageSize = 10; // Number of rows per page
  currentPage = 1; // Current page index

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  private getAuthHeaders() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');
  }

  private handleError(error: any) {
    console.error('Error:', error);
    if (error.status === 500 && error.error.message === 'Failed to authenticate token') {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', {
        duration: 3000,
        panelClass: ['snack-bar-error'] // Custom class for error messages
      });
      this.router.navigateByUrl('/login');
    }
  }

  loadUsers() {
    const headers = this.getAuthHeaders();

    const params = new HttpParams()
      .set('page', (this.currentPage - 1).toString())
      .set('pageSize', this.paginationPageSize.toString());

    this.http.get<any[]>('http://localhost:3000/users', { headers, params }).subscribe(
      data => {
        this.rowData = data.map((user, index) => ({
          ...user,
          slno: (this.currentPage - 1) * this.paginationPageSize + index + 1
        }));
        this.cdr.detectChanges(); // Trigger change detection explicitly
      },
      error => this.handleError(error)
    );
  }

  onPageChanged(event: PaginationChangedEvent) {
    this.currentPage = event.api.paginationGetCurrentPage() + 1;
    // this.loadUsers(); // Reload data when pagination changes
  }

  onAdd() {
    const dialogRef = this.dialog.open(DashboardEntryComponent, {
      width: '600px',
      data: { user: { username: '', fullname: '', mobileno: '', password: '' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh data after adding
        this.snackBar.open('User added successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-success'] // Custom class for success messages
        });
      }
    });
  }

  onEdit(user: any) {
    const dialogRef = this.dialog.open(DashboardEntryComponent, {
      width: '400px',
      data: { user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh data after editing
        this.snackBar.open('User updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-success'] // Custom class for success messages
        });
      }
    });
  }

  onDelete(userId: number) {
    const headers = this.getAuthHeaders();

    this.http.delete(`http://localhost:3000/users/${userId}`, { headers }).subscribe(
      () => {
        this.loadUsers(); // Refresh data after deleting
        this.snackBar.open('User deleted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-success'] // Custom class for success messages
        });
      },
      error => {
        this.handleError(error);
        this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-error'] // Custom class for error messages
        });
      }
    );
  }

  actionCellRenderer(params: any) {
    const eGui = document.createElement('div');
    eGui.innerHTML = `
      <button class="btn btn-primary btn-sm edit-button">Edit</button>
      <button class="btn btn-danger btn-sm delete-button">Delete</button>
    `;

    eGui.querySelector('.edit-button')!.addEventListener('click', () => {
      this.onEdit(params.data);
    });

    eGui.querySelector('.delete-button')!.addEventListener('click', () => {
      this.onDelete(params.data.id);
    });

    return eGui;
  }
}
