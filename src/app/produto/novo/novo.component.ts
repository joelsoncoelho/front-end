import { CurrencyUtils } from './../../utils/currency-utils';
import { Component, OnInit, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormControlName, AbstractControl, FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, fromEvent, merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Produto, Fornecedor } from '../models/produto';
import { ProdutoService } from '../services/produto.service';
import { ImageCroppedEvent, ImageTransform, Dimensions, LoadedImage } from 'ngx-image-cropper';


@Component({
  selector: 'app-novo',
  templateUrl: './novo.component.html'
})
export class NovoComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  //limpar formularios
  @ViewChild('formDir') private formDir: NgForm;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio: boolean;
  transform = 0;
  imageURL: string;
  imagemNome: string;

  produto: Produto;
  fornecedores: Fornecedor[];
  errors: any[] = [];
  produtoForm!: FormGroup;

  formResult: string = '';

  submitted = false;

  mudancasNaoSalvas: boolean;

  constructor(private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
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

  }

  ngOnInit(): void {

    this.produtoService.obterFornecedores()
      .subscribe(
        fornecedores => this.fornecedores = fornecedores);

    this.produtoForm = this.fb.group({
      fornecedorId: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]],
      imagem: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      ativo: [true]
    });
  }

  ngAfterViewInit(): void {
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    merge(...controlBlurs).subscribe(() => {

      this.mudancasNaoSalvas = true;
    });
  }

  adicionarProduto() {

    this.submitted = true;

    if (this.produtoForm.dirty && this.produtoForm.valid) {
      this.produto = Object.assign({}, this.produto, this.produtoForm.value);
      //this.formResult = JSON.stringify(this.produto);

      this.produto.imagemUpload = this.croppedImage.split(',')[1];
      this.produto.imagem = this.imagemNome;
      this.produto.valor = CurrencyUtils.StringParaDecimal(this.produto.valor);

      this.produtoService.novoProduto(this.produto)
        .subscribe({
          next: (sucesso: any) => { this.processarSucesso(sucesso) },
          error: (falha: any) => { this.processarFalha(falha) }
        });

      this.mudancasNaoSalvas = false;
    }
  }

  processarSucesso(response: any) {
    this.produtoForm.reset();
    this.formDir.resetForm();
    this.errors = [];

    let toast = this.toastr.success('Produto cadastrado com sucesso!', 'Sucesso!');
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

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.imagemNome = event.currentTarget.files[0].name;
  }

  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }

  imageLoaded(image: LoadedImage) {
      // show cropper
    const width = image.original.size.width;
    const height = image.original.size.height;
    console.log(width);
    console.log(height);

    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
      // cropper ready
    console.log('Cropper ready', sourceImageDimensions);

  }

  loadImageFailed() {
      // show message
    this.errors.push('O formato do arquivo ' +this.imagemNome+ 'não é aceito.');
  }
}

