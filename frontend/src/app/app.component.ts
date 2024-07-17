// Import necessary modules and interfaces
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importing FormsModule for two-way data binding
import { CommonModule } from '@angular/common'; // Importing CommonModule for common directives
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, MatInputModule, MatButtonModule, MatDialogModule, HttpClientModule, RouterLink, RouterOutlet, RouterLinkActive, ReactiveFormsModule, AgGridModule], // Import FormsModule and CommonModule
  templateUrl: './app.component.html', // Template URL
  styleUrls: ['./app.component.scss'], // Styles URL
})
export class AppComponent {


}
