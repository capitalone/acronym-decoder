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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { DefinitionService } from './definition.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { LookupSource } from '../../models/lookup-source.enum';
import { ConfigModel } from '../../models/config.model';
import { LookupModel } from '../../models/lookup.model';

describe('DefinitionService', () => {
    let service: DefinitionService;
    let mockConfigService: jasmine.SpyObj<ConfigurationService>;

    const localConfig = Object.assign(new ConfigModel(), {
        enableRemoteLookup: false,
        lookupApiUrl: 'https://api.example.com/lookup?term='
    });

    const remoteConfig = Object.assign(new ConfigModel(), {
        enableRemoteLookup: true,
        lookupApiUrl: 'https://api.example.com/lookup?term='
    });

    const mockGlossary: LookupModel[] = [
        Object.assign(new LookupModel(), { acronym: 'API', definition: 'Application Programming Interface', links: [], related: [] }),
        Object.assign(new LookupModel(), { acronym: 'CLI', definition: 'Command Line Interface', links: [], related: [] }),
        Object.assign(new LookupModel(), { acronym: 'API', definition: 'Another API definition', links: [], related: [] })
    ];

    beforeEach(() => {
        mockConfigService = jasmine.createSpyObj<ConfigurationService>(
            'ConfigurationService',
            ['getConfiguration', 'getJsonFileContent']
        );
        mockConfigService.getConfiguration.and.returnValue(of(localConfig));

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                DefinitionService,
                { provide: ConfigurationService, useValue: mockConfigService }
            ]
        });

        service = TestBed.inject(DefinitionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call getConfiguration on creation and cache the config', () => {
        expect(mockConfigService.getConfiguration).toHaveBeenCalled();
        expect(service.config).toEqual(localConfig);
    });

    describe('lookupTermLocally', () => {
        beforeEach(() => {
            mockConfigService.getJsonFileContent.and.returnValue(of(mockGlossary));
        });

        it('should return all definitions matching the search term', () => {
            let results: LookupModel[];
            service.lookupTermLocally('API', LookupSource.popup).subscribe(r => results = r);
            expect(results.length).toBe(2);
        });

        it('should match case-insensitively', () => {
            let results: LookupModel[];
            service.lookupTermLocally('api', LookupSource.popup).subscribe(r => results = r);
            expect(results.length).toBe(2);
            expect(results.every(r => r.acronym === 'API')).toBeTrue();
        });

        it('should return an empty array when no acronym matches', () => {
            let results: LookupModel[];
            service.lookupTermLocally('XYZ', LookupSource.popup).subscribe(r => results = r);
            expect(results.length).toBe(0);
        });

        it('should record the previous search term', () => {
            service.lookupTermLocally('CLI', LookupSource.popup).subscribe();
            expect(service.previousSearchTerm).toBe('CLI');
        });
    });

    describe('lookupTerm routing', () => {
        it('should call lookupTermLocally when enableRemoteLookup is false', () => {
            spyOn(service, 'lookupTermLocally').and.returnValue(of([]));
            spyOn(service, 'lookupTermRemotely').and.returnValue(of([]));

            service.lookupTerm('API', LookupSource.popup);

            expect(service.lookupTermLocally).toHaveBeenCalledWith('API', LookupSource.popup);
            expect(service.lookupTermRemotely).not.toHaveBeenCalled();
        });

        it('should call lookupTermRemotely when enableRemoteLookup is true', () => {
            service.config = remoteConfig;
            spyOn(service, 'lookupTermLocally').and.returnValue(of([]));
            spyOn(service, 'lookupTermRemotely').and.returnValue(of([]));

            service.lookupTerm('API', LookupSource.popup);

            expect(service.lookupTermRemotely).toHaveBeenCalledWith('API', LookupSource.popup);
            expect(service.lookupTermLocally).not.toHaveBeenCalled();
        });
    });

    describe('lookupTermRemotely', () => {
        it('should call fetch with the correct URL and return the slurp array', (done) => {
            service.config = remoteConfig;
            const mockDefinitions = [{ acronym: 'API', definition: 'Test definition' }];
            const mockFetchResponse = new Response(
                JSON.stringify({ slurp: mockDefinitions }),
                { status: 200 }
            );
            spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockFetchResponse));

            service.lookupTermRemotely('API', LookupSource.popup).subscribe(results => {
                expect(results).toEqual(mockDefinitions as any);
                expect(window.fetch).toHaveBeenCalledWith(
                    'https://api.example.com/lookup?term=API&dep=false'
                );
                done();
            });
        });
    });
});
