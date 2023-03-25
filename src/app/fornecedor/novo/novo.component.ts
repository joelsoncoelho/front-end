import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControlName, AbstractControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, fromEvent, merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Fornecedor } from '../models/fornecedor';
import { FornecedorService } from '../services/fornecedor.service';
import { CepConsulta } from '../models/endereco';
import { StringUtils } from 'src/app/utils/string-utils';


@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html'
})
export class NovoComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

    //limpar formularios
    @ViewChild('formDir') private formDir: NgForm;

  errors: any[] = [];
  fornecedorForm!: FormGroup;
  fornecedor: Fornecedor = new Fornecedor();

  formResult: string = '';

  mudancasNaoSalvas!: boolean;

  submitted = false;

  textoDocumento: string = 'CPF (requerido)';

  textoErroCpfCnpj!: string;

  constructor(private formBuilder: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private toastr: ToastrService) {
  }

  ngOnInit() {

    this.fornecedorForm = this.formBuilder.group({
      nome: ['', [Validators.required]],
      documento: ['', [Validators.required]],
      ativo: ['', [Validators.required]],
      tipoFornecedor: ['', [Validators.required]],

      endereco: this.formBuilder.group({
        logradouro: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        complemento: [''],
        bairro: ['', [Validators.required]],
        cep: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        estado: ['', [Validators.required]]
      })
    });
    this.fornecedorForm.patchValue({ tipoFornecedor: '1', ativo: true })
  }

  ngAfterViewInit(): void {
    this.tipoFornecedorForm().valueChanges.subscribe(() => {
      this.trocarValidacaodocumento();
      this.configurarElementosValidacao();
      this.validarFormulario();
    });

    this.configurarElementosValidacao();
  }

  configurarElementosValidacao() {
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    merge(...controlBlurs).subscribe(() => {

      this.validarFormulario();
    });
  }

  validarFormulario() {
    this.mudancasNaoSalvas = true;
  }

  //troca a validacao de acordo com a ação.
  trocarValidacaodocumento() {
    this.documento().clearValidators();
    this.documento().addValidators([Validators.required]);
    if (this.tipoFornecedorForm().value === "1") {
      this.textoDocumento = 'CPF (requerido)';
      this.documento().reset();
    } else {
      this.textoDocumento = 'CNPJ (requerido)';
      this.documento().reset();
    }
  }

  tipoFornecedorForm(): AbstractControl {
    return this.fornecedorForm.get('tipoFornecedor')!;
  }

  documento(): AbstractControl {
    return this.fornecedorForm.get('documento')!;
  }

  buscarCep(event: any) {

    let cep = StringUtils.somenteNumeros(event.target.value);
    console.log(cep);

    if (cep !== '') {
      this.fornecedorService.consultarCep(cep)
        .subscribe(
          {
            next: (cepRetorno) => {
              this.preencherEnderecoConsulta(cepRetorno)
            },
            error: (erro) => {
              this.errors.push(erro)
            },
            complete: () => console.log('Finished sequence')
          });
    }

  }

  preencherEnderecoConsulta(cepConsulta: CepConsulta) {
    this.fornecedorForm.patchValue({
      endereco: {
        logradouro: cepConsulta.logradouro,
        bairro: cepConsulta.bairro,
        cep: cepConsulta.cep,
        cidade: cepConsulta.localidade,
        estado: cepConsulta.uf
      }
    });
  }

  adicionarFornecedor() {

    this.submitted = true;

    if (this.fornecedorForm.dirty && this.fornecedorForm.valid) {

      this.fornecedor = Object.assign({}, this.fornecedor, this.fornecedorForm.value);

      this.fornecedor.endereco.cep = StringUtils.somenteNumeros(this.fornecedor.endereco.cep);
      this.fornecedor.documento = StringUtils.somenteNumeros(this.fornecedor.documento);

      this.fornecedor.tipoFornecedor = this.fornecedor.tipoFornecedor == 1 ? +'1' : +'2';

    //this.formResult = JSON.stringify(this.fornecedor);

     // console.log(this.formResult);

      this.fornecedorService.novoFornecedor(this.fornecedor)
        .subscribe(
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

  }

  processarSucesso(response: any) {

    // Usar o método reset para limpar os controles na tela
    this.fornecedorForm.reset(new Fornecedor());
    this.formDir.resetForm();
    this.errors = [];

    this.mudancasNaoSalvas = false;

    let toast = this.toastr.success('Fornecedor cadastrado com sucesso!', 'Sucesso!');
    if (toast) {
      toast.onHidden.subscribe(() => {
        this.router.navigate(['/fornecedores/listar-todos']);
      });
    }
  }

  processarFalha(fail: any) {
    this.errors = fail.error.errors;
    this.toastr.error('Ocorreu um erro!', 'Opa :(');
  }

  get f(): { [key: string]: AbstractControl } {
    return this.fornecedorForm.controls;
  }

}
