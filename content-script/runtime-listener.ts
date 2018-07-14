/*
Copyright 2018 Capital One Services, LLC Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
 */

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeWhile';
import {OptionsModel, OptionsModelKeys} from '../src/app/models/options.model';
import {ModifierEnum} from '../src/app/models/modifier.enum';

export class RuntimeListener {

    toShadow: HTMLElement;
    shadow: ShadowRoot;
    lastData: any;
    options: OptionsModel = new OptionsModel();
    singleClickListenerActive = false;
    dblClickWithMeta = false;

    constructor() {
        this.initializeOptions();
        console.log('RuntimeListener');
    }

    // Get options and listen for changes
    initializeOptions() {
        chrome.storage.local.get(OptionsModelKeys,
            (results) => {
                this.options = new OptionsModel(results);
                if (this.options.lookupEnabled) {
                    this.enableLookup();
                }
            });
        chrome.storage.onChanged.addListener(
            (changes, namespace) => {
                console.log('Options changed', changes);
                for (const key in changes) {
                    if (OptionsModelKeys.indexOf(key) > -1) {
                        if (key === 'lookupEnabled') {
                            if (!changes.lookupEnabled.oldValue && changes.lookupEnabled.newValue) {
                                this.enableLookup();
                            } else if (changes.lookupEnabled.oldValue && !changes.lookupEnabled.newValue) {
                                this.disableLookup();
                            }
                        }
                        this.options[key] = changes[key].newValue;
                    }
                }
            });
    }


    // Set onMessage and double click listener to start lookup
    enableLookup() {
        chrome.runtime.onMessage.addListener(this.messagesListener);
        document.addEventListener('dblclick', this.lookupClickListener);
        document.addEventListener('selectionchange', this.selectionChangedListener);
    }

    // Remove onMessage and double click listener to stop lookup
    disableLookup() {
        document.removeEventListener('selectionchange', this.selectionChangedListener);
        document.removeEventListener('dblclick', this.lookupClickListener);
        chrome.runtime.onMessage.removeListener(this.messagesListener);
    }

    // Take passed component HTML and apply to a new shadow DOM (prevents page styling from affecting lookup modal)
    createLookupHtml(data: any) {
        if (this.toShadow && this.shadow && this.lastData) {
            const rect = this.shadow.children[0].getBoundingClientRect();
            // Use the same coordinates if a word inside the lookup modal is looked up
            if (data.coord.x > rect.left && data.coord.x < rect.right
                && data.coord.y > rect.top && data.coord.y < rect.bottom) {
                data.coord = this.lastData.coord;
            }
            // Remove current lookup modal if one exists
            document.body.removeChild(this.toShadow);
        }
        this.lastData = data;
        this.toShadow = document.createElement('div');
        // Set positioning of lookup modal on the page
        this.toShadow.setAttribute('style', `position: absolute; left: ${data.coord.pageX}px; top: ${data.coord.pageY}px; z-index: 9999;`);
        this.shadow = this.toShadow.attachShadow({mode: 'closed'});
        // TODO Inject styles from file, instead of hard coding them here. Research @import and <link> inside shadow dom.
        this.shadow.innerHTML = `${data.element}
                                <style>
                                    .lookup-popup {
                                        min-width: 300px;
                                        max-width: 600px;
                                        padding: 20px;
                                        background: #ffffff;
                                        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
                                    }
                                    a.header {
                                        font-weight: bold;
                                        font-size: 18px;
                                        color: black;
                                        text-decoration: none;
                                    }
                                    ol, p {
                                        font-size: 14px;
                                    }
                                    ul li {
                                        list-style-type: square;
                                    }
                                </style>`;
        document.body.appendChild(this.toShadow);
        document.addEventListener('click', this.clickOutsideListener, false);
        this.dblClickWithMeta = false;
    }

    // Listener to remove lookup modal when click is outside of the box
    clickOutsideListener = (event: MouseEvent) => {
        if (this.toShadow && this.shadow) {
            const rect = this.shadow.children[0].getBoundingClientRect();
            if (event.x < rect.left || event.x > rect.right || event.y < rect.top || event.y > rect.bottom) {
                document.body.removeChild(this.toShadow);
                this.toShadow = undefined;
                this.shadow = undefined;
                document.removeEventListener('click', this.clickOutsideListener, false);
            }
        }
    };

    lookupClickListener = (event: MouseEvent) => {
        const query = this.getTrimmedSelection();
        if (query !== '') {
            let modifierSuccess = false;
            switch (this.options.lookupModifier) {
                case(ModifierEnum.dbl_click):
                    modifierSuccess = !event.ctrlKey && !event.altKey && !event.metaKey;
                    break;
                case(ModifierEnum.ctrl_dbl_click):
                    modifierSuccess = event.ctrlKey;
                    break;
                case(ModifierEnum.alt_dbl_click):
                    modifierSuccess = event.altKey;
                    break;
                case(ModifierEnum.meta_dbl_click):
                    modifierSuccess = event.metaKey;
                    break;
                case(ModifierEnum.ctrl_alt_dbl_click):
                    modifierSuccess = event.ctrlKey && event.altKey;
                    break;
            }
            if (modifierSuccess) {
                this.dblClickWithMeta = true;
                chrome.runtime.sendMessage({
                    command: 'lookup',
                    query: query,
                    coord: {pageX: event.pageX, pageY: event.pageY, x: event.x, y: event.y}
                });
            }
        }
    };

    messagesListener = (data, sender, sendResponse) => {
        console.log('onMessage', data);
        switch (data.command) {
            case 'openEmail': {
                console.log('Received command: ' + data.command);
                this.openEmail(data.email);
                sendResponse('success');
                break;
            }
            case 'lookupElement': {
                console.log('Received command: ' + data.command);
                this.createLookupHtml(data);
                sendResponse('success');
                break;
            }
            default: {
                console.log('Unknown command detected!');
                break;
            }
        }
    };

    selectionChangedListener = () => {
        const selection: Selection = window.getSelection();
        setTimeout(() => {
            if (!selection.isCollapsed && !this.singleClickListenerActive && !this.dblClickWithMeta) {
                this.singleClickListenerActive = true;
                document.addEventListener('click', this.lookupClickListener);
            } else if (selection.isCollapsed && this.singleClickListenerActive) {
                document.removeEventListener('click', this.lookupClickListener);
                this.singleClickListenerActive = false;
            }
        }, 100);
    };

    getTrimmedSelection() {
        const selection = String(window.getSelection());
        return selection.replace(/^\s+|\s+$/g, '');
    }

    openEmail(email): void {
        console.log('openEmail received: ' + email);

        const mailtoPath = 'mailto:' + email;
        let c = 0;
        if (chrome.tabs) {
            // In order to fix the issue with mailto, open a new tab and set the URL to the mailto path
            chrome.tabs.create({'url': mailtoPath}, function (tab) {
                Observable.interval(300)
                    .takeWhile(() => c > 0)
                    .subscribe(i => {
                        c++;
                        chrome.tabs.remove(tab.id);
                    });
            });
        }
    }
}
