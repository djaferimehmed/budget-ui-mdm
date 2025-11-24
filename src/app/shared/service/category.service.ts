import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCriteria, CategoryUpsertDto, Page, AllCategoryCriteria } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/categories';

  getAllCategories(criteria?: AllCategoryCriteria): Observable<Category[]> {
    let params = new HttpParams();

    if (criteria?.sort) {
      params = params.set('sort', criteria.sort);
    }

    if (criteria?.name) {
      params = params.set('name', criteria.name);
    }

    return this.http.get<Category[]>(this.baseUrl, { params });
  }

  getCategories(criteria: CategoryCriteria): Observable<Page<Category>> {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    if (criteria.name) {
      params = params.set('name', criteria.name);
    }

    return this.http.get<Page<Category>>(`${this.baseUrl}/page`, { params });
  }

  upsertCategory(dto: CategoryUpsertDto): Observable<Category> {
    if (dto.id) {
      return this.http.put<Category>(`${this.baseUrl}/${dto.id}`, dto);
    } else {
      return this.http.post<Category>(this.baseUrl, dto);
    }
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

