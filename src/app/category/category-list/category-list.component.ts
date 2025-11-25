import { Component, inject, OnInit, signal } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, alertCircleOutline, search, swapVertical, chevronForward } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, switchMap, startWith, from } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import CategoryModalComponent from '../category-modal/category-modal.component';
import { CategoryService } from '../../shared/service/category.service';
import { Category, CategoryCriteria } from '../../shared/domain';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner
  ]
})
export default class CategoryListComponent implements OnInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly categoryService = inject(CategoryService);
  private readonly toastCtrl = inject(ToastController);

  // State
  categories = signal<Category[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  currentSort = signal('name,asc');
  
  private searchSubject = new Subject<string>();

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, search, alertCircleOutline, add, chevronForward });
  }

  ngOnInit(): void {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
      switchMap(searchTerm => {
        this.loading.set(true);
        return from(this.loadCategories(searchTerm));
      })
    ).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories.set([]);
        this.loading.set(false);
      }
    });
  }

  // Data Loading

  private async loadCategories(searchTerm: string = ''): Promise<Category[]> {
    try {
      const criteria: CategoryCriteria = {
        page: 0,
        size: 100,
        sort: this.currentSort(),
        name: searchTerm || undefined
      };
      
      const page = await firstValueFrom(this.categoryService.getCategories(criteria));
      return page.content;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }

  // Actions

  onSearchChange(event: any): void {
    const value = event.detail.value || '';
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  async onSortChange(event: any): Promise<void> {
    const sort = event.detail.value;
    this.currentSort.set(sort);
    this.loading.set(true);
    
    try {
      const categories = await this.loadCategories(this.searchTerm());
      this.categories.set(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async openAddModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent
    });
    
    await modal.present();
    const { role } = await modal.onWillDismiss();
    
    if (role === 'saved') {
      // Reload categories
      this.searchSubject.next(this.searchTerm());
      
      // Show success message
      const toast = await this.toastCtrl.create({
        message: 'Category saved successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  }

  async openEditModal(category: Category): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent,
      componentProps: { category }
    });
    
    await modal.present();
    const { role } = await modal.onWillDismiss();
    
    if (role === 'saved') {
      // Reload categories
      this.searchSubject.next(this.searchTerm());
      
      // Show success message
      const toast = await this.toastCtrl.create({
        message: 'Category updated successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } else if (role === 'deleted') {
      // Reload categories
      this.searchSubject.next(this.searchTerm());
      
      // Show success message
      const toast = await this.toastCtrl.create({
        message: 'Category deleted successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  }
}
