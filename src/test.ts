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

// Initialize the Angular testing environment.
// Spec files are auto-discovered and loaded by @angular-devkit/build-angular's
// FindTestsPlugin (matching tsconfig.spec.json's include glob), so no manual
// require.context / __karma__ manipulation is needed here.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
