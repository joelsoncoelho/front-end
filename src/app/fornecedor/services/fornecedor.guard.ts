import { BaseGuard } from 'src/app/services/base.guard';
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LocalStorageUtils } from "src/app/utils/localstorage";
import { NovoComponent } from "../novo/novo.component";

@Injectable()
export class FornecedorGuard extends BaseGuard implements CanActivate, CanDeactivate<NovoComponent> {

  constructor(protected router: Router) {
    super(router);
  }

  canDeactivate(component: NovoComponent) {

    if (component.mudancasNaoSalvas) {
      return window.confirm('Tem certeza que deseja abandonar o preenchimento do formulário?')
    }
    return true;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return super.validarClaims(route);

  }

}
