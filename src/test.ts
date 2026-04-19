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

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Global Chrome extension API mock — must be set before any spec files are loaded
// so that module-level chrome.* calls in background.ts and components do not throw.
(window as any)['chrome'] = {
    runtime: {
        getURL: (path: string) => `https://test-extension-id/${path}`,
        openOptionsPage: () => {},
        onMessage: { addListener: () => {} }
    },
    storage: {
        local: {
            get: (_keys: any, callback: (result: any) => void) => callback({}),
            set: (_data: any, callback?: () => void) => { if (callback) callback(); }
        },
        onChanged: {
            addListener: () => {}
        }
    },
    tabs: {
        create: (_opts: any, callback?: (tab: any) => void) => { if (callback) callback({ id: 1 }); },
        remove: () => {},
        query: (_opts: any, callback: (tabs: any[]) => void) => callback([{ id: 1 }]),
        sendMessage: () => {}
    }
};

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare const __karma__: any;
declare const require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = function () {};

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);

// Find and load all spec files.
const context = require.context('./', true, /\.spec\.ts$/);
context.keys().map(context);

// Start Karma.
__karma__.start();
