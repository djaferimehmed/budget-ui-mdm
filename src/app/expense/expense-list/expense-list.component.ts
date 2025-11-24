import { Component, inject } from '@angular/core';
import { addMonths, format, set } from 'date-fns';
import { ModalController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  add, 
  alertCircleOutline, 
  arrowBack, 
  arrowForward, 
  chevronBack,
  chevronForward,
  personCircle,
  pricetag, 
  search, 
  swapVertical 
} from 'ionicons/icons';
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
  IonItemGroup,
  IonItemDivider,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonFabButton
} from '@ionic/angular/standalone';
import ExpenseModalComponent from '../expense-modal/expense-modal.component';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonList,
    IonItemGroup,
    IonItemDivider,
    IonItem,
    IonLabel,
    IonChip,
    IonButton,
    IonFabButton
  ]
})
export default class ExpenseListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // State
  date = set(new Date(), { date: 1 });

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ 
      swapVertical, 
      pricetag, 
      search, 
      alertCircleOutline, 
      add, 
      arrowBack, 
      arrowForward,
      chevronBack,
      chevronForward,
      personCircle
    });
  }

  // Actions

  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
  };

  async openAddModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent
    });
    await modal.present();
  }

  get currentMonthYear(): string {
    return format(this.date, 'MMMM yyyy');
  }
}
