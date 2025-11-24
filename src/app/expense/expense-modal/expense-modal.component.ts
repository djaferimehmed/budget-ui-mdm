import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, ToastController, LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, alertCircle, calendar, cash, close, pricetag, save, text, trash } from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonNote
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { firstValueFrom } from 'rxjs';
import { ExpenseService } from '../../shared/service/expense.service';
import { CategoryService } from '../../shared/service/category.service';
import { Category, ExpenseUpsertDto } from '../../shared/domain';
import CategoryModalComponent from '../../category/category-modal/category-modal.component';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonNote
  ]
})
export default class ExpenseModalComponent implements OnInit, AfterViewInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);

  // ViewChild
  @ViewChild('nameInput', { read: ElementRef }) nameInput?: ElementRef<HTMLIonInputElement>;

  // State
  form!: FormGroup;
  categories: Category[] = [];
  loading = false;
  errorMessage = '';

  // Lifecycle

  constructor() {
    addIcons({ close, save, text, pricetag, add, cash, calendar, trash, alertCircle });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    // Focus name input after view init
    setTimeout(() => {
      this.nameInput?.nativeElement.setFocus();
    }, 300);
  }

  // Initialization

  private initForm(): void {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      categoryId: [null],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [today, Validators.required]
    });
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await firstValueFrom(this.categoryService.getAllCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }

  // Actions

  cancel(): void {
    if (!this.loading) {
      this.modalCtrl.dismiss(null, 'cancel');
    }
  }

  async save(): Promise<void> {
    if (this.loading || this.form.invalid) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        this.errorMessage = 'Please fill in all required fields correctly.';
      }
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loading = await this.loadingCtrl.create({
      message: 'Saving...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const formValue = this.form.value;
      const dto: ExpenseUpsertDto = {
        name: formValue.name,
        amount: parseFloat(formValue.amount),
        date: formValue.date,
        categoryId: formValue.categoryId || undefined
      };

      await firstValueFrom(this.expenseService.upsertExpense(dto));

      await loading.dismiss();
      this.loading = false;

      // Show success message
      const toast = await this.toastCtrl.create({
        message: 'Expense saved successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Close modal
      this.modalCtrl.dismiss(null, 'saved');
    } catch (error: any) {
      await loading.dismiss();
      this.loading = false;

      // Show error message
      this.errorMessage = error.error?.message || 'An error occurred while saving. Please try again.';
      
      const toast = await this.toastCtrl.create({
        message: this.errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  delete(): void {
    // Not implemented for create mode
  }

  async showCategoryModal(): Promise<void> {
    const categoryModal = await this.modalCtrl.create({ 
      component: CategoryModalComponent 
    });
    await categoryModal.present();
    
    const { data, role } = await categoryModal.onWillDismiss();
    
    if (role === 'saved' && data) {
      // Reload categories and select the new one
      await this.loadCategories();
      if (data.id) {
        this.form.patchValue({ categoryId: data.id });
      }
    }
  }

  // Helpers

  get name() { return this.form.get('name'); }
  get categoryId() { return this.form.get('categoryId'); }
  get amount() { return this.form.get('amount'); }
  get date() { return this.form.get('date'); }
}
