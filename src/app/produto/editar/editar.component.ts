import { CurrencyUtils } from './../../utils/currency-utils';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControlName, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, fromEvent, merge } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { Produto, Fornecedor } from '../models/produto';
import { ProdutoService } from '../services/produto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html'
})
export class EditarComponent implements OnInit {

  imagens: string = environment.imagensUrl;

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  imageBase64: any;
  imagemPreview: any;
  imagemNome: string;
  imagemOriginalSrc: string;

  produto: Produto;
  fornecedores: Fornecedor[];
  errors: any[] = [];

  produtoForm!: FormGroup;

  formResult: string = '';

  mudancasNaoSalvas: boolean;

  constructor(private formBuilder: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService) {

   /*
    this.validationMessages = {
      fornecedorId: {
        required: 'Escolha um fornecedor',
      },
      nome: {
        required: 'Informe o Nome',
        minlength: 'Mínimo de 2 caracteres',
        maxlength: 'Máximo de 200 caracteres'
      },
      descricao: {
        required: 'Informe a Descrição',
        minlength: 'Mínimo de 2 caracteres',
        maxlength: 'Máximo de 1000 caracteres'
      },
      imagem: {
        required: 'Informe a Imagem',
      },
      valor: {
        required: 'Informe o Valor',
      }
    };

    */

    this.produto = this.route.snapshot.data['produto'];

  }

  ngOnInit(): void {

    this.produtoService.obterFornecedores()
      .subscribe(
        fornecedores => this.fornecedores = fornecedores);

    this.produtoForm = this.formBuilder.group({
      fornecedorId: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]],
      imagem: [''],
      valor: ['', [Validators.required]],
      ativo: [0]
    });

    this.produtoForm.patchValue({
      fornecedorId: this.produto.fornecedorId,
      id: this.produto.id,
      nome: this.produto.nome,
      descricao: this.produto.descricao,
      ativo: this.produto.ativo,
      valor: CurrencyUtils.DecimalParaString(this.produto.valor)
    });

    //utilizar o [src] na imagem para evitar que se perca após post
    this.imagemOriginalSrc = this.imagens + this.produto.imagem;

  }

  ngAfterViewInit(): void {
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    merge(...controlBlurs).subscribe(() => {

      this.mudancasNaoSalvas = true;
    });
  }

  editarProduto() {
    if (this.produtoForm.dirty && this.produtoForm.valid) {
      this.produto = Object.assign({}, this.produto, this.produtoForm.value);

      if (this.imageBase64) {
        this.produto.imagemUpload = this.imageBase64;
        this.produto.imagem = this.imagemNome;
      }

      this.produto.valor = CurrencyUtils.StringParaDecimal(this.produto.valor);

      console.log(this.produto);

      this.produtoService.atualizarProduto(this.produto)
        .subscribe({
          next(sucesso) {
            this.processarSucesso(sucesso)
          },
          error(falha) {
            this.processarFalha(falha)
          },
          complete: () => console.log('Finished sequence'),
        });
      this.mudancasNaoSalvas = false;
    }
  }

  processarSucesso(response: any) {
    this.produtoForm.reset();
    this.errors = [];

    let toast = this.toastr.success('Produto editado com sucesso!', 'Sucesso!');
    if (toast) {
      toast.onHidden.subscribe(() => {
        this.router.navigate(['/produtos/listar-todos']);
      });
    }
  }

  processarFalha(fail: any) {
    this.errors = fail.error.errors;
    this.toastr.error('Ocorreu um erro!', 'Opa :(');
  }

  get f(): { [key: string]: AbstractControl } {
    return this.produtoForm.controls;
  }

  upload(file: any) {
    this.imagemNome = file[0].name;

    var reader = new FileReader();
    reader.onload = this.manipularReader.bind(this);
    reader.readAsBinaryString(file[0]);
  }

  manipularReader(readerEvt: any) {
    var binaryString = readerEvt.target.result;
    this.imageBase64 = btoa(binaryString);
    this.imagemPreview = "data:image/jpeg;base64," + this.imageBase64;
  }
}

