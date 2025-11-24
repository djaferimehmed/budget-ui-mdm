import { Routes } from '@angular/router';
import { categoriesPath } from './category/category.routes';
import { expensesPath } from './expense/expense.routes';

export const defaultPath = categoriesPath;

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: defaultPath,
    pathMatch: 'full'
  },
  {
    path: categoriesPath,
    loadChildren: () => import('./category/category.routes')
  },
  {
    path: expensesPath,
    loadChildren: () => import('./expense/expense.routes')
  },
  {
    path: '**',
    redirectTo: defaultPath
  }
];
export default appRoutes;
