import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseCriteria, ExpenseUpsertDto, Page } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/expenses';

  getExpenses(criteria: ExpenseCriteria): Observable<Page<Expense>> {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      criteria.categoryIds.forEach(id => {
        params = params.append('categoryIds', id);
      });
    }

    if (criteria.name) {
      params = params.set('name', criteria.name);
    }

    if (criteria.yearMonth) {
      params = params.set('yearMonth', criteria.yearMonth);
    }

    return this.http.get<Page<Expense>>(this.baseUrl, { params });
  }

  upsertExpense(dto: ExpenseUpsertDto): Observable<Expense> {
    if (dto.id) {
      return this.http.put<Expense>(`${this.baseUrl}/${dto.id}`, dto);
    } else {
      return this.http.post<Expense>(this.baseUrl, dto);
    }
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

