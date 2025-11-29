import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular/standalone';
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
import { Category, ExpenseUpsertDto, Expense } from '../../shared/domain';
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
  private readonly alertCtrl = inject(AlertController);

  // Input - will be set via componentProps when modal is created
  @Input() expenseInput?: Expense;

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
    
    // If editing, populate form with expense data
    if (this.expenseInput) {
      this.form.patchValue({
        name: this.expenseInput.name,
        amount: this.expenseInput.amount,
        date: this.expenseInput.date,
        categoryId: (this.expenseInput.category as any)?.id || null
      });
    }
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
    if (this.loading) {
      return;
    }

    // Validate form
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      
      // Get specific validation errors
      const errors: string[] = [];
      if (this.name?.invalid) errors.push('Name is required');
      if (this.amount?.invalid) {
        if (this.amount.errors?.['required']) {
          errors.push('Amount is required');
        } else if (this.amount.errors?.['min']) {
          errors.push('Amount must be greater than 0');
        }
      }
      if (this.date?.invalid) errors.push('Date is required');
      
      this.errorMessage = errors.length > 0 
        ? errors.join(', ') 
        : 'Please fill in all required fields correctly.';
      
      const toast = await this.toastCtrl.create({
        message: this.errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
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
      
      // Validate and parse amount
      const amount = parseFloat(formValue.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a valid number greater than 0');
      }
      
      // Ensure date is in correct format (YYYY-MM-DD)
      let date = formValue.date;
      if (date && date.includes('.')) {
        // Convert DD.MM.YYYY to YYYY-MM-DD
        const parts = date.split('.');
        if (parts.length === 3) {
          date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      const dto: ExpenseUpsertDto = {
        id: this.expenseInput?.id,
        name: formValue.name.trim(),
        amount: amount,
        date: date,
        categoryId: formValue.categoryId && formValue.categoryId !== 'null' && formValue.categoryId !== null 
          ? formValue.categoryId 
          : undefined
      };

      console.log('Saving expense:', dto);
      const savedExpense = await firstValueFrom(this.expenseService.upsertExpense(dto));
      console.log('Expense saved successfully:', savedExpense);

      await loading.dismiss();
      this.loading = false;

      // Show success message
      const toast = await this.toastCtrl.create({
        message: this.expenseInput ? 'Expense updated successfully!' : 'Expense created successfully!',
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

      // Log detailed error for debugging
      console.error('Error saving expense:', error);
      console.error('Error details:', {
        message: error.message,
        error: error.error,
        status: error.status,
        statusText: error.statusText
      });

      // Show error message
      let errorMsg = 'An error occurred while saving. Please try again.';
      
      if (error.message) {
        errorMsg = error.message;
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.error?.error) {
        errorMsg = error.error.error;
      } else if (typeof error.error === 'string') {
        errorMsg = error.error;
      }
      
      this.errorMessage = errorMsg;
      
      const toast = await this.toastCtrl.create({
        message: errorMsg,
        duration: 4000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  async delete(): Promise<void> {
    if (!this.expenseInput?.id || this.loading) {
      return;
    }

    // Show confirmation alert
    const alert = await this.alertCtrl.create({
      header: 'Delete Expense',
      message: `Are you sure you want to delete "${this.expenseInput.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.performDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  private async performDelete(): Promise<void> {
    if (!this.expenseInput?.id || this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loading = await this.loadingCtrl.create({
      message: 'Deleting...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await firstValueFrom(this.expenseService.deleteExpense(this.expenseInput.id));

      await loading.dismiss();
      this.loading = false;

      // Show success message
      const toast = await this.toastCtrl.create({
        message: 'Expense deleted successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Close modal
      this.modalCtrl.dismiss(null, 'deleted');
    } catch (error: any) {
      await loading.dismiss();
      this.loading = false;

      // Show error message
      this.errorMessage = error.error?.message || 'An error occurred while deleting. Please try again.';
      
      const toast = await this.toastCtrl.create({
        message: this.errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
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
