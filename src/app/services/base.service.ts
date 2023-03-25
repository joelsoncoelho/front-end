import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { LocalStorageUtils } from "../utils/localstorage";

export abstract class BaseService {

  public LocalStorage = new LocalStorageUtils();

  protected baseURL: string = environment.apiUrlv1;

  protected obterHeaderJson(){
    return {
      headers: new HttpHeaders({
        'content-type': 'application/json'
      })
    };
  }

  protected obterAuthHeaderJson() {
    return {
      headers: new HttpHeaders({
        'Content-type': 'application/json',
        'Authorization': `Bearer ${this.LocalStorage.obterTokenUsuario()}`
      })
    };
  }

  protected extractData(response: any){
    return response.data || {};
  }

  protected serviceError(response: Response | any) {
    let customError: string[] = [];
    let customResponse = { error: { errors: [] }}

    if (response instanceof HttpErrorResponse) {

        if (response.statusText === "Unknown Error") {
            customError.push("Ocorreu um erro desconhecido");
            response.error.errors = customError;
        }
    }
    if (response.status === 500) {
        customError.push("Ocorreu um erro no processamento, tente novamente mais tarde ou contate o nosso suporte.");

        // Erros do tipo 500 não possuem uma lista de erros
        // A lista de erros do HttpErrorResponse é readonly
        customResponse.error.errors = customError;
        return throwError(customResponse);
    }

    console.error(response);
    return throwError(response);
}

}
