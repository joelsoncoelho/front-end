import { ListaProdutosComponent } from './produtos/lista-produtos.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NovoComponent } from './novo/novo.component';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { FornecedorRoutingModule } from './fornecedor.route';
import { FornecedorAppComponent } from './fornecedor.app.component';
import { ListaComponent } from './lista/lista.component';
import { FornecedorService } from './services/fornecedor.service';

import { EditarComponent } from './editar/editar.component';
import { ExcluirComponent } from './excluir/excluir.component';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { NgxMaskModule } from 'ngx-mask';
import { FornecedorResolve } from './services/fornecedor.resolve';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FornecedorGuard } from './services/fornecedor.guard';

@NgModule({
  declarations: [
    FornecedorAppComponent,
    NovoComponent,
    ListaComponent,
    EditarComponent,
    ExcluirComponent,
    DetalhesComponent,
    ListaProdutosComponent
  ],
  imports: [
    CommonModule,
    FornecedorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
    NgxSpinnerModule
  ],
  providers: [
    FornecedorService,
    FornecedorResolve,
    FornecedorGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FornecedorModule { }
