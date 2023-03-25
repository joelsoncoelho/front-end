import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControlName, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, fromEvent, merge } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { Fornecedor } from '../models/fornecedor';
import { CepConsulta, Endereco } from '../models/endereco';
import { FornecedorService } from '../services/fornecedor.service';
import { StringUtils } from 'src/app/utils/string-utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html'
})
export class EditarComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  errors: any[] = [];
  errorsEndereco: any[] = [];
  fornecedorForm!: FormGroup;
  enderecoForm!: FormGroup;

  fornecedor: Fornecedor = new Fornecedor();
  endereco: Endereco = new Endereco();

  textoDocumento: string = '';

  tipoFornecedor!: number;

  mudancasNaoSalvas!: boolean;

  submitted = false;

  constructor(private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService) {

   // this.fornecedorService.obterPorId(route.params['id'])
   //   .subscribe(fornecedor => this.fornecedor = fornecedor);

   this.fornecedor = this.route.snapshot.data['fornecedor'];
   this.tipoFornecedor = this.fornecedor.tipoFornecedor;
  }

  ngOnInit() {

  /** spinner starts on init */
  this.spinner.show();


    this.fornecedorForm = this.fb.group({
      id: '',
      nome: ['', [Validators.required]],
      documento: '',
      ativo: ['', [Validators.required]],
      tipoFornecedor: ['', [Validators.required]]
    });

    this.enderecoForm = this.fb.group({
      id: '',
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cep: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      fornecedorId: ''
    });

    this.fornecedorForm.patchValue({ tipoFornecedor: '1', ativo: true })
    this.preencherForm();

    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 5000);

  }

  preencherForm() {

    this.fornecedorForm.patchValue({
      id: this.fornecedor.id,
      nome: this.fornecedor.nome,
      ativo: this.fornecedor.ativo,
      tipoFornecedor: this.fornecedor.tipoFornecedor.toString(),
      documento: this.fornecedor.documento,
    });

    this.enderecoForm.patchValue({
      id: this.fornecedor.endereco.id,
      logradouro: this.fornecedor.endereco.logradouro,
      numero: this.fornecedor.endereco.numero,
      complemento: this.fornecedor.endereco.complemento,
      bairro: this.fornecedor.endereco.bairro,
      cep: this.fornecedor.endereco.cep,
      cidade: this.fornecedor.endereco.cidade,
      estado: this.fornecedor.endereco.estado
    });

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

    //troca a validacao de acordo com a ação.
    trocarValidacaodocumento() {
      if (this.tipoFornecedorForm().value === "1") {
        this.documento().clearValidators();
        this.documento().setValidators([Validators.required]);
      }

      else {
        this.documento().clearValidators();
        this.documento().setValidators([Validators.required]);
      }
    }

  validarFormulario() {
    this.mudancasNaoSalvas = true;
  }

  buscarCep(event: any) {

    let cep = StringUtils.somenteNumeros(event.target.value);
    console.log(cep);

    if (cep !== '') {
      if (cep.length < 8) return;

      this.fornecedorService.consultarCep(cep)
        .subscribe({
          next: cepRetorno => this.preencherEnderecoConsulta(cepRetorno),
          error: erro => this.errors.push(erro)
        });
    }
  }

  preencherEnderecoConsulta(cepConsulta: CepConsulta) {

    this.enderecoForm.patchValue({
      logradouro: cepConsulta.logradouro,
      bairro: cepConsulta.bairro,
      cep: cepConsulta.cep,
      cidade: cepConsulta.localidade,
      estado: cepConsulta.uf
    });
  }

  editarFornecedor() {
    if (this.fornecedorForm.dirty && this.fornecedorForm.valid) {

      this.fornecedor = Object.assign({}, this.fornecedor, this.fornecedorForm.value);
      this.fornecedor.documento = StringUtils.somenteNumeros(this.fornecedor.documento);

      /* Workaround para evitar cast de string para int no back-end */
      this.fornecedor.tipoFornecedor = parseInt(this.fornecedor.tipoFornecedor.toString());

      this.fornecedorService.atualizarFornecedor(this.fornecedor)
        .subscribe(
          {
            next: (sucesso) => {
              this.processarSucesso(sucesso)
            },
            error: (falha) => {
              this.processarFalha(falha)
            },
            complete: () => console.log('Finished sequence')
          });

      this.mudancasNaoSalvas = false;
    }
  }

  editarEndereco() {
    if (this.enderecoForm.dirty && this.enderecoForm.valid) {

      this.endereco = Object.assign({}, this.endereco, this.enderecoForm.value);
      this.endereco.cep = StringUtils.somenteNumeros(this.endereco.cep);
      this.endereco.fornecedorId = this.fornecedor.id;

      this.fornecedorService.atualizarEndereco(this.endereco)
        .subscribe(
          {
            next: () => {
              this.processarSucessoEndereco(this.endereco)
            },
            error: (falha) => {
              this.processarFalhaEndereco(falha)
            },
            complete: () => console.log('Finished sequence')
          });
      }
  }

  processarSucessoEndereco(endereco: Endereco) {
    this.errors = [];

    this.toastr.success('Endereço atualizado com sucesso!', 'Sucesso!');
    this.fornecedor.endereco = endereco;
    this.modalService.dismissAll(); // dispensar a janela modal
  }

  processarFalhaEndereco(fail: any) {
    this.errorsEndereco = fail.error.errors;
    this.toastr.error('Ocorreu um erro!', 'Opa :(');
  }


  processarSucesso(response: any) {
    this.errors = [];

    let toast = this.toastr.success('Fornecedor atualizado com sucesso!', 'Sucesso!');
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

  tipoFornecedorForm(): AbstractControl {
      return this.fornecedorForm.get('tipoFornecedor')!;
    }

  documento(): AbstractControl {
      return this.fornecedorForm.get('documento')!;
  }

  abrirModal(content) {
    this.modalService.open(content);
  }

}
