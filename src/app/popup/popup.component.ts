/*
SPDX-Copyright: Copyright (c) Capital One Services,LLC
SPDX-License-Identifier: Apache-2.0

Copyright 2018 Capital One Services, LLC
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
 */

import {Component, OnInit} from '@angular/core';
import {DefinitionService} from '../core/definition/definition.service';
import {ConfigurationService} from '../core/configuration/configuration.service';
import openOptionsPage = chrome.runtime.openOptionsPage;
import {ConfigModel} from '../models/config.model';
import {LookupSource} from '../models/lookup-source.enum';
import { openDefaultEmailAddress } from '../../background';

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

    // other definitions
    config: ConfigModel;
    extensionVersion = '';
    searchTerm = '';
    previousSearchTerm = '';
    searchResults = null;
    isLoading = false;

    constructor(private definitionService: DefinitionService,
                private configurationService: ConfigurationService) {
    }

    ngOnInit() {
        this.populateConfiguration();
        this.populateExtensionVersion();
    }

    get isBackendOnline() {
        return ConfigurationService.isBackendOnline;
    }

    /**
     * Populates the configuration
     */
    populateConfiguration(): void {
        this.configurationService.getConfiguration().subscribe(
            (config: ConfigModel) => {
                this.config = config;
            }
        );
    }

    /**
     * Populates the extension version
     */
    populateExtensionVersion(): void {
        this.configurationService.getExtensionVersion()
            .subscribe(version => {
                this.extensionVersion = version;
            });
    }

    /**
     * Calls the lookup api and displays the results
     */
    lookupTerm(): void {
        this.isLoading = true;
        this.previousSearchTerm = this.searchTerm.toUpperCase();
        this.definitionService.lookupTerm(this.searchTerm, LookupSource.popup).subscribe(
            (res) => {
                this.isLoading = false;
                this.searchResults = res;
            });
    }

    /**
     * Opens default email for the user
     *
     * @param email
     */
    openDefaultEmail(email): void {
        openDefaultEmailAddress(email);
    }

    /**
     * Open your Extension's options page, if possible.
     */
    openOptionsPage(): void {
        openOptionsPage();
    }
}
