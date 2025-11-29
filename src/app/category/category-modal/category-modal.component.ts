import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef, Input, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, text, trash, alertCircle } from 'ionicons/icons';
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
  IonSpinner,
  IonText,
  IonNote
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../shared/service/category.service';
import { Category, CategoryUpsertDto } from '../../shared/domain';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  templateUrl: './category-modal.component.html',
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
    IonSpinner,
    IonText,
    IonNote
  ]
})
export default class CategoryModalComponent implements OnInit, AfterViewInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly alertCtrl = inject(AlertController);

  // ViewChild
  @ViewChild('nameInput', { read: ElementRef }) nameInput?: ElementRef<HTMLIonInputElement>;

  // Input - will be set via componentProps when modal is created
  @Input() categoryInput?: Category;

  // State
  form?: FormGroup;
  loading = false;
  errorMessage = '';

  // Lifecycle

  constructor() {
    addIcons({ close, save, text, trash, alertCircle });
  }

  ngOnInit(): void {
    // Get category from componentProps (set via @Input)
    // In Ionic standalone components, componentProps map to @Input properties
    this.initForm();
  }

  // Helper to get category
  get category(): Category | undefined {
    return this.categoryInput;
  }

  ngAfterViewInit(): void {
    // Focus name input after view init
    setTimeout(() => {
      this.nameInput?.nativeElement.setFocus();
    }, 300);
  }

  // Initialization

  private initForm(): void {
    this.form = this.fb.group({
      name: [this.categoryInput?.name || '', [Validators.required, Validators.minLength(1)]]
    });
  }

  // Actions

  cancel(): void {
    if (!this.loading) {
      this.modalCtrl.dismiss(null, 'cancel');
    }
  }

  async save(): Promise<void> {
    if (this.loading || !this.form || this.form.invalid) {
      if (this.form?.invalid) {
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
      const dto: CategoryUpsertDto = {
        id: this.categoryInput?.id,
        name: formValue.name.trim()
      };

      console.log('Saving category:', dto);
      const savedCategory = await firstValueFrom(this.categoryService.upsertCategory(dto));
      console.log('Category saved successfully:', savedCategory);

      await loading.dismiss();
      this.loading = false;

      // Show success message
      const toast = await this.toastCtrl.create({
        message: this.categoryInput ? 'Category updated successfully!' : 'Category created successfully!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Close modal with saved data
      this.modalCtrl.dismiss(savedCategory, 'saved');
    } catch (error: any) {
      await loading.dismiss();
      this.loading = false;

      // Log detailed error for debugging
      console.error('Error saving category:', error);
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
    if (!this.categoryInput?.id || this.loading) {
      return;
    }

    // Show confirmation alert
    const alert = await this.alertCtrl.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${this.categoryInput.name}"? This action cannot be undone.`,
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
    if (!this.categoryInput?.id || this.loading) {
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
      await firstValueFrom(this.categoryService.deleteCategory(this.categoryInput.id));

      await loading.dismiss();
      this.loading = false;

      // Show success message
      const toast = await this.toastCtrl.create({
        message: 'Category deleted successfully!',
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

  // Helpers

  get name() { return this.form?.get('name'); }
}
