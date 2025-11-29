import { Component, inject, OnInit, signal } from '@angular/core';
import { addMonths, format, set, parseISO } from 'date-fns';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
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
  IonFabButton,
  IonSpinner
} from '@ionic/angular/standalone';
import ExpenseModalComponent from '../expense-modal/expense-modal.component';
import { ExpenseService } from '../../shared/service/expense.service';
import { Expense, ExpenseCriteria } from '../../shared/domain';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
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
    IonItemGroup,
    IonItemDivider,
    IonItem,
    IonLabel,
    IonChip,
    IonButton,
    IonFabButton,
    IonSpinner
  ]
})
export default class ExpenseListComponent implements OnInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly expenseService = inject(ExpenseService);
  private readonly toastCtrl = inject(ToastController);

  // State
  date = signal(set(new Date(), { date: 1 }));
  expenses = signal<Expense[]>([]);
  loading = signal(false);

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

  // Lifecycle

  ngOnInit(): void {
    this.loadExpenses();
  }

  // Data Loading

  private async loadExpenses(): Promise<void> {
    this.loading.set(true);
    try {
      const yearMonth = format(this.date(), 'yyyy-MM');
      const criteria: ExpenseCriteria = {
        page: 0,
        size: 1000,
        sort: 'date,desc',
        yearMonth
      };
      
      const page = await firstValueFrom(this.expenseService.getExpenses(criteria));
      this.expenses.set(page.content);
    } catch (error) {
      console.error('Error loading expenses:', error);
      this.expenses.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Actions

  addMonths = (number: number): void => {
    this.date.set(addMonths(this.date(), number));
    this.loadExpenses();
  };

  async openAddModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent
    });
    
    await modal.present();
    const { role } = await modal.onWillDismiss();
    
    if (role === 'saved' || role === 'deleted') {
      await this.loadExpenses();
      
      const message = role === 'saved' 
        ? 'Expense saved successfully!' 
        : 'Expense deleted successfully!';
      
      const toast = await this.toastCtrl.create({
        message,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  }

  async openEditModal(expense: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: { expenseInput: expense }
    });
    
    await modal.present();
    const { role } = await modal.onWillDismiss();
    
    if (role === 'saved' || role === 'deleted') {
      await this.loadExpenses();
      
      const message = role === 'saved' 
        ? 'Expense updated successfully!' 
        : 'Expense deleted successfully!';
      
      const toast = await this.toastCtrl.create({
        message,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  }

  get currentMonthYear(): string {
    return format(this.date(), 'MMMM yyyy');
  }

  // Helpers

  get groupedExpenses(): Map<string, Expense[]> {
    const grouped = new Map<string, Expense[]>();
    
    this.expenses().forEach(expense => {
      const dateKey = format(parseISO(expense.date), 'dd.MM.yyyy');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(expense);
    });
    
    return grouped;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
