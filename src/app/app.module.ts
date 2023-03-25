//import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule } from 'ngx-mask'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavegacaoModule } from './navegacao/navegaco.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './services/error.handler.service';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
];

// **************************************************
import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(ptBr);
// **************************************************

//import { HttpClientModule } from '@angular/common/http';
//import { CustomFormsModule } from 'ngx-custom-validators';


@NgModule({
    declarations: [
        AppComponent
    ],
  providers: [httpInterceptorProviders,
     // ************************************
     { provide: LOCALE_ID, useValue: 'pt' },
     // ************************************
  ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NavegacaoModule,
        NgbModule,
        BrowserAnimationsModule, // required animations module
        ToastrModule.forRoot({
            //timeOut: 10000,
          //  positionClass: 'toast-top-right',
           // preventDuplicates: true,
        }),
        NgxMaskModule.forRoot({
            dropSpecialCharacters: false   //ao salvar, vai manter a mascara
        }),
      NgxSpinnerModule,
      HttpClientModule

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
