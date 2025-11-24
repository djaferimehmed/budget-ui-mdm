import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { close, save, text, trash } from 'ionicons/icons';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  imports: [ReactiveFormsModule]
})
export default class CategoryModalComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ close, save, text, trash });
  }

  // Actions

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    this.modalCtrl.dismiss(null, 'save');
  }

  delete(): void {
    this.modalCtrl.dismiss(null, 'delete');
  }
}
