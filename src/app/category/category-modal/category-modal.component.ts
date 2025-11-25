import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
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

  // Input
  @Input() category?: Category;

  // ViewChild
  @ViewChild('nameInput', { read: ElementRef }) nameInput?: ElementRef<HTMLIonInputElement>;

  // State
  form?: FormGroup;
  loading = false;
  errorMessage = '';

  // Lifecycle

  constructor() {
    addIcons({ close, save, text, trash, alertCircle });
  }

  ngOnInit(): void {
    this.initForm();
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
      name: [this.category?.name || '', [Validators.required, Validators.minLength(1)]]
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
        id: this.category?.id,
        name: formValue.name
      };

      const savedCategory = await firstValueFrom(this.categoryService.upsertCategory(dto));

      await loading.dismiss();
      this.loading = false;

      // Show success message
      const toast = await this.toastCtrl.create({
        message: this.category ? 'Category updated successfully!' : 'Category created successfully!',
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

  async delete(): Promise<void> {
    if (!this.category?.id || this.loading) {
      return;
    }

    // Show confirmation alert
    const alert = await this.alertCtrl.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${this.category.name}"? This action cannot be undone.`,
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
    if (!this.category?.id || this.loading) {
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
      await firstValueFrom(this.categoryService.deleteCategory(this.category.id));

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
