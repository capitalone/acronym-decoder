/*
SPDX-Copyright: Copyright (c) Capital One Services,
LLC SPDX-License-Identifier: Apache-2.0

Copyright 2018 Capital One Services, LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
 */

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {HomepageComponent} from './homepage/homepage.component';
import {EventPageComponent} from './event-page/event-page.component';
import {PopupComponent} from './popup/popup.component';
import {NgbModule} from '../../node_modules/@ng-bootstrap/ng-bootstrap/index';
import {ConfigurationService} from './core/configuration/configuration.service';
import {AppMaterialModule} from './custom-modules/app-material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {LookupComponent} from './lookup/lookup.component';
import {CoreModule} from './core/core.module';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        CoreModule,
        AppRoutingModule,
        HttpClientModule,
        NgbModule.forRoot(),
        FlexLayoutModule,
        AppMaterialModule
    ],
    declarations: [
        AppComponent,
        HomepageComponent,
        EventPageComponent,
        PopupComponent,
        LookupComponent
    ],
    entryComponents: [
        LookupComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

