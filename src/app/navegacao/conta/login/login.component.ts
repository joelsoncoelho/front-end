import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormControlName } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { fromEvent, merge, Observable } from 'rxjs';

import { Usuario } from '../models/usuario';
import { ContaService } from '../services/conta.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit  {

  @ViewChildren(FormControlName, { read: ElementRef })formInputElements!: ElementRef[];

  errors: any[] = [];
  usuario!: Usuario;

  returnUrl: string;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  submitted = false;

  constructor(private formBuilder: FormBuilder,
    private contaService: ContaService,
    private router: Router,
      private route: ActivatedRoute,
    private toastr: ToastrService) {

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];

    }

  ngOnInit(): void {

    this.loginForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]]
      }
    );

  }

  ngAfterViewInit(): void {
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

      merge(...controlBlurs).subscribe(()=> {

      })
  }

  login(){
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

      this.usuario = Object.assign({}, this.usuario, this.loginForm.value);
      this.contaService.login(this.usuario).subscribe(
        {
            next: (sucesso) => {
              this.processarSucesso(sucesso)
            },
            error: (erro) => {
                    this.processarFalha(erro)
                    console.log(erro)
            },

            complete: () => console.log('Finished sequence')
        }
      );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  processarSucesso(response: any){
    //console.log(response)
    this.submitted = false;
    this.loginForm.reset();
    this.errors = [];

    //salvar no storage do browser
    this.contaService.LocalStorage.salvarDadosLocaisUsuario(response);
    let toast = this.toastr.success('Login realizado com sucesso!', 'Bem vindo!!!');

    if (toast) {
      toast.onHidden.subscribe(() => {
        this.returnUrl ? this.router.navigate([this.returnUrl]) : this.router.navigate(['/home']);
      })
    }



  }

  processarFalha(fail: any){
    //console.log(fail)
    this.errors = fail.error.errors;
    this.toastr.error('Ocorreu um erro!', 'Opa :(');
  }

}
