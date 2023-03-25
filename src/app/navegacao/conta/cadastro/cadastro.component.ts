import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { fromEvent, merge, Observable } from 'rxjs';
import PasswordMatcher from 'src/app/utils/password-matcher';

import { Usuario } from '../models/usuario';
import { ContaService } from '../services/conta.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef })formInputElements!: ElementRef[];

  errors: any[] = [];
  usuario!: Usuario;

  //regex = '/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])(?:([0-9a-zA-Z$*&@#])(?!\1)){8,}$/i';

/*
(?=.*\d)              // deve conter ao menos um dígito
  (?=.*[a-z])           // deve conter ao menos uma letra minúscula
  (?=.*[A-Z])           // deve conter ao menos uma letra maiúscula
  (?=.*[$*&@#])         // deve conter ao menos um caractere especial
  [0-9a-zA-Z$*&@#]     // deve conter ao menos 8 dos caracteres mencionados
  (?!\1)){8,}$/i .     // deve rejeitar também sequências como aA,
*/

  cadastroForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl('')
  });

  submitted = false;

  mudancasNaoSalvas!: boolean;

  constructor(private formBuilder: FormBuilder,
    private contaService: ContaService,
      private router: Router,
        private toastr: ToastrService) {}

  ngOnInit(): void {

    this.cadastroForm = this.formBuilder.group(
      {

        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16),
            //Validators.pattern(this.regex)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: [PasswordMatcher.match('password', 'confirmPassword')]
      }
    );

  }

  ngAfterViewInit(): void {
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

      merge(...controlBlurs).subscribe(()=> {
        this.mudancasNaoSalvas = true;
      })
  }

  adicionarConta(){
    this.submitted = true;

    if (this.cadastroForm.invalid) {
      return;
    }

      this.usuario = Object.assign({}, this.usuario, this.cadastroForm.value);
      this.contaService.registarUsuario(this.usuario).subscribe(
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
      this.mudancasNaoSalvas = false;
      // alert(`O usuário ${this.usuario.email} foi cadastrado com sucesso. \n Dados: ${JSON.stringify(this.usuario)}`);

  }

  get f(): { [key: string]: AbstractControl } {
    return this.cadastroForm.controls;
  }

  processarSucesso(response: any){
    //console.log(response)
    this.submitted = false;
    this.cadastroForm.reset();
    this.errors = [];

    //salvar no storage do browser
    this.contaService.LocalStorage.salvarDadosLocaisUsuario(response);
    let toast = this.toastr.success('Registro realizado com sucesso!', 'Bem vindo!!!');

    toast.onHidden.subscribe(() => {
      this.router.navigate(['/home']);
    })

  }

  processarFalha(fail: any){
    //console.log(fail)
    this.errors = fail.error.errors;
    this.toastr.error('Ocorreu um erro!', 'Opa :(');
  }

}
