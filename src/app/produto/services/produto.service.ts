import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { BaseService } from 'src/app/services/base.service';
import { Produto, Fornecedor } from '../models/produto';

@Injectable()
export class ProdutoService extends BaseService {

    constructor(private http: HttpClient) { super() }

    obterTodos(): Observable<Produto[]> {
        return this.http
            .get<Produto[]>(this.baseURL + "produtos", this.obterAuthHeaderJson())
            .pipe(catchError(super.serviceError));
    }

    obterPorId(id: string): Observable<Produto> {
        return this.http
            .get<Produto>(this.baseURL + "produtos/" + id, super.obterAuthHeaderJson())
            .pipe(catchError(super.serviceError));
    }

    novoProduto(produto: Produto): Observable<Produto> {
        return this.http
            .post(this.baseURL + "produtos", produto, super.obterAuthHeaderJson())
            .pipe(
                map(super.extractData),
                catchError(super.serviceError));
    }

    atualizarProduto(produto: Produto): Observable<Produto> {
        return this.http
            .put(this.baseURL + "produtos/" + produto.id, produto, super.obterAuthHeaderJson())
            .pipe(
                map(super.extractData),
                catchError(super.serviceError));
    }

    excluirProduto(id: string): Observable<Produto> {
        return this.http
            .delete(this.baseURL + "produtos/" + id, super.obterAuthHeaderJson())
            .pipe(
                map(super.extractData),
                catchError(super.serviceError));
    }

    obterFornecedores(): Observable<Fornecedor[]> {
        return this.http
            .get<Fornecedor[]>(this.baseURL + "fornecedores")
            .pipe(catchError(super.serviceError));
    }
}
