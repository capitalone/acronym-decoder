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

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PopupComponent } from './popup.component';
import { DefinitionService } from '../core/definition/definition.service';
import { ConfigurationService } from '../core/configuration/configuration.service';
import { ConfigModel } from '../models/config.model';
import { LookupSource } from '../models/lookup-source.enum';

describe('PopupComponent', () => {
    let component: PopupComponent;
    let fixture: ComponentFixture<PopupComponent>;
    let mockDefinitionService: jasmine.SpyObj<DefinitionService>;
    let mockConfigService: jasmine.SpyObj<ConfigurationService>;

    const mockConfig = Object.assign(new ConfigModel(), {
        enableRemoteLookup: false,
        contactEmail: 'test@example.com'
    });

    beforeEach(waitForAsync(() => {
        mockDefinitionService = jasmine.createSpyObj<DefinitionService>(
            'DefinitionService',
            ['lookupTerm']
        );
        mockConfigService = jasmine.createSpyObj<ConfigurationService>(
            'ConfigurationService',
            ['getConfiguration', 'getExtensionVersion']
        );
        mockConfigService.getConfiguration.and.returnValue(of(mockConfig));
        mockConfigService.getExtensionVersion.and.returnValue(of('1.0.0'));

        TestBed.configureTestingModule({
            declarations: [PopupComponent],
            providers: [
                { provide: DefinitionService, useValue: mockDefinitionService },
                { provide: ConfigurationService, useValue: mockConfigService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should populate config on init', () => {
        expect(mockConfigService.getConfiguration).toHaveBeenCalled();
        expect(component.config).toEqual(mockConfig);
    });

    it('should populate extension version on init', () => {
        expect(mockConfigService.getExtensionVersion).toHaveBeenCalled();
        expect(component.extensionVersion).toBe('1.0.0');
    });

    describe('lookupTerm', () => {
        it('should set isLoading to true then false and populate searchResults', () => {
            const mockResults = [{ acronym: 'API', definition: 'Test', links: [], related: [] }];
            mockDefinitionService.lookupTerm.and.returnValue(of(mockResults as any));
            component.searchTerm = 'api';

            component.lookupTerm();

            expect(mockDefinitionService.lookupTerm).toHaveBeenCalledWith('api', LookupSource.popup);
            expect(component.isLoading).toBeFalse();
            expect(component.searchResults).toEqual(mockResults as any);
        });

        it('should uppercase the previous search term', () => {
            mockDefinitionService.lookupTerm.and.returnValue(of([]));
            component.searchTerm = 'api';
            component.lookupTerm();
            expect(component.previousSearchTerm).toBe('API');
        });
    });
});
