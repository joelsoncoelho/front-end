import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { BaseService } from "src/app/services/base.service";
import { Usuario } from "../models/usuario";

@Injectable()
export class ContaService extends BaseService{

  constructor(private http: HttpClient){
    super();
  }

  registarUsuario(usuario: Usuario): Observable<Usuario>{
    let response = this.http.post(this.baseURL + 'nova-conta', usuario, this.obterHeaderJson())
    .pipe(
      map(this.extractData),
      catchError(this.serviceError))
    return response;
  }

  registarUsuarioNovo(usuario: Usuario): Observable<any>{
    const headers = { 'content-type': 'application/json'}
    const body=JSON.stringify(usuario);
    console.log(body)
    return this.http.post(this.baseURL + 'nova-conta' + 'people', body,{'headers':headers})

   }

  login(usuario: Usuario): Observable<Usuario>{
    let response = this.http.post(this.baseURL + 'entrar', usuario, this.obterHeaderJson())
    .pipe(
      map(this.extractData),
      catchError(this.serviceError))
    return response;
  }

}
