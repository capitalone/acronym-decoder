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

import {Component, ViewContainerRef, Injector, OnInit} from '@angular/core';
import {LookupComponent} from '../lookup/lookup.component';
import {DefinitionService} from '../core/definition/definition.service';
import {OptionsModel, OptionsModelKeys} from '../models/options.model';
import {LookupSource} from '../models/lookup-source.enum';
import {LookupModel} from '../models/lookup.model';

@Component({
    selector: 'app-event-page',
    templateUrl: './event-page.component.html',
    styleUrls: ['./event-page.component.css']
})
export class EventPageComponent implements OnInit {

    options: OptionsModel;

    static openDefaultEmail(email: string): void {
        const mailtoPath = 'mailto:' + email;

        chrome.tabs.create({'url': mailtoPath}, function (tab) {
            setTimeout(function () {
                chrome.tabs.remove(tab.id);
            }, 500);
        });
    }

    constructor(private definitionService: DefinitionService,
                private resolver: ViewContainerRef) {
    }

    ngOnInit() {
        console.log('setup event page');
        this.initializeOptions();
        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            console.log('get message, event page', data);
            switch (data.command) {
                case 'lookup': {
                    console.log('Received command: ' + data.command);
                    console.log('Looking up!', data.query);
                    this.generateLookup(data);
                    sendResponse('success');
                    break;
                }
                default: {
                    console.log('Unknown command detected!');
                    break;
                }
            }
        });
    }

    /**
     * Get options and listen for changes
     */
    initializeOptions() {
        chrome.storage.local.get(OptionsModelKeys,
            (results) => {
                this.options = new OptionsModel(results);
            });
        chrome.storage.onChanged.addListener(
            (changes, namespace) => {
                console.log('Acronym Decoder options changed', changes);
                for (const key in changes) {
                    if (OptionsModelKeys.indexOf(key) > -1) {
                        this.options[key] = changes[key].newValue;
                    }
                }
            });
    }

    /**
     * Looks up the definition for the searched term
     *
     * @param data
     */
    generateLookup(data: any) {
        this.definitionService.lookupTerm(data.query, LookupSource.lookup).subscribe(
            (definitions: LookupModel[]) => {
                if (definitions.length > 0 || this.options.notFoundDialog) {
                    const component = this.resolver.createComponent(LookupComponent);
                   
                    component.instance.lookupWord = data.query;
                    component.instance.definitions = definitions;
                    component.instance.changeDetectorRef.detectChanges();

                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            command: 'lookupElement',
                            element: component.location.nativeElement.innerHTML,
                            coord: data.coord
                        });
                    });
                }
            }
        );
    }
}
