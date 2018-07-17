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

import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfigurationService} from '../core/configuration/configuration.service';
import {OptionsModel, OptionsModelKeys} from '../models/options.model';
import {DomSanitizer} from '@angular/platform-browser';
import {ConfigModel} from '../models/config.model';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomepageComponent implements OnInit {

    config: ConfigModel;
    options: OptionsModel = new OptionsModel();
    extensionVersion = '';
    slackChannelNativeUrl;

    savingOptions: boolean;
    optionsSaved: boolean;

    constructor(private configurationService: ConfigurationService, private domSanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.populateConfiguration();
        this.populateOptions();
        this.populateExtensionVersion();
    }

    /**
     * Populates the configuration
     */
    populateConfiguration(): void {
        this.configurationService.getConfiguration().subscribe(
            (config: ConfigModel) => {
                this.config = config;
                // To avoid unsafe prefix for the link
                this.slackChannelNativeUrl = this.domSanitizer.bypassSecurityTrustUrl(this.config.slackChannelLink);
            }
        );
    }

    /**
     * Populates the options
     */
    populateOptions(): void {
        chrome.storage.local.get(OptionsModelKeys,
            (result: any) => {
                this.options = new OptionsModel(result);
                console.log('options', this.options);
            });
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

    saveOptions() {
        this.optionsSaved = false;
        this.savingOptions = true;
        chrome.storage.local.set(this.options, () => {
            /* Unknown issue where callback is extremely slow even after changes
             * have been picked up by content-script, sometimes callback not fired.
             */

            // this.savingOptions = false;
            // this.optionsSaved = true;
        });
        // Fake saving spinner
        setTimeout(() => {
            this.savingOptions = false;
            this.optionsSaved = true;
        }, 2000);
    }

    optionsChanged() {
        this.optionsSaved = false;
        this.savingOptions = false;
    }

}
