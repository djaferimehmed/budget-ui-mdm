import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { barChart, logOut, podium, pricetag } from 'ionicons/icons';
import { categoriesPath } from './category/category.routes';
import { expensesPath } from './expense/expense.routes';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    // Ionic
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonRouterOutlet,
    IonButton
  ]
})
export default class AppComponent {
  readonly appPages = [
    { title: 'Expenses', url: `/${expensesPath}`, icon: 'bar-chart' },
    { title: 'Categories', url: `/${categoriesPath}`, icon: 'pricetag' }
  ];

  constructor() {
    // Add all used Ionic icons
    addIcons({ barChart, logOut, podium, pricetag });
  }
}
