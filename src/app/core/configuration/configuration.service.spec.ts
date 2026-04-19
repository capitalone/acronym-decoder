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

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ConfigurationService } from './configuration.service';
import { ConfigModel } from '../../models/config.model';

describe('ConfigurationService', () => {
    let service: ConfigurationService;
    let httpMock: HttpTestingController;

    const EXTENSION_URL = 'https://test-extension-id';
    const mockConfig: ConfigModel = Object.assign(new ConfigModel(), {
        enableRemoteLookup: false,
        lookupApiUrl: 'https://api.example.com/lookup?term=',
        contactEmail: 'test@example.com'
    });
    const mockManifest = { version: '2.0.0' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ConfigurationService]
        });
        service = TestBed.inject(ConfigurationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialise isBackendOnline to true', () => {
        expect(ConfigurationService.isBackendOnline).toBeTrue();
    });

    describe('getJsonFileContent', () => {
        it('should build the URL via chrome.runtime.getURL and return the response', () => {
            const mockData = [{ acronym: 'API', definition: 'Application Programming Interface' }];
            let result: any;

            service.getJsonFileContent('glossary.json').subscribe(data => result = data);

            const req = httpMock.expectOne(`${EXTENSION_URL}/glossary.json`);
            expect(req.request.method).toBe('GET');
            req.flush(mockData);

            expect(result).toEqual(mockData);
        });
    });

    describe('getConfiguration', () => {
        it('should fetch config.json on first call', () => {
            let result: ConfigModel;
            service.getConfiguration().subscribe(c => result = c);

            const req = httpMock.expectOne(`${EXTENSION_URL}/config.json`);
            req.flush(mockConfig);

            expect(result).toEqual(mockConfig);
        });

        it('should return cached config on subsequent calls without a new HTTP request', () => {
            service.getConfiguration().subscribe();
            httpMock.expectOne(`${EXTENSION_URL}/config.json`).flush(mockConfig);

            let cached: ConfigModel;
            service.getConfiguration().subscribe(c => cached = c);
            httpMock.expectNone(`${EXTENSION_URL}/config.json`);

            expect(cached).toEqual(mockConfig);
        });
    });

    describe('getExtensionVersion', () => {
        it('should fetch manifest.json and return the version string', () => {
            let version: string;
            service.getExtensionVersion().subscribe(v => version = v);

            httpMock.expectOne(`${EXTENSION_URL}/manifest.json`).flush(mockManifest);

            expect(version).toBe('2.0.0');
        });

        it('should return cached version on subsequent calls without a new HTTP request', () => {
            service.getExtensionVersion().subscribe();
            httpMock.expectOne(`${EXTENSION_URL}/manifest.json`).flush(mockManifest);

            let cached: string;
            service.getExtensionVersion().subscribe(v => cached = v);
            httpMock.expectNone(`${EXTENSION_URL}/manifest.json`);

            expect(cached).toBe('2.0.0');
        });
    });
});
