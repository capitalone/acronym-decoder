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
import { BrowserModule } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

import { HomepageComponent } from './homepage.component';
import { ConfigurationService } from '../core/configuration/configuration.service';
import { ConfigModel } from '../models/config.model';

describe('HomepageComponent', () => {
    let component: HomepageComponent;
    let fixture: ComponentFixture<HomepageComponent>;
    let mockConfigService: jasmine.SpyObj<ConfigurationService>;

    const mockConfig = Object.assign(new ConfigModel(), {
        enableRemoteLookup: false,
        slackChannelLink: 'https://slack.example.com',
        slackChannelName: 'test-channel'
    });

    beforeEach(waitForAsync(() => {
        mockConfigService = jasmine.createSpyObj<ConfigurationService>(
            'ConfigurationService',
            ['getConfiguration', 'getExtensionVersion']
        );
        mockConfigService.getConfiguration.and.returnValue(of(mockConfig));
        mockConfigService.getExtensionVersion.and.returnValue(of('1.0.0'));

        TestBed.configureTestingModule({
            imports: [BrowserModule],
            declarations: [HomepageComponent],
            providers: [
                { provide: ConfigurationService, useValue: mockConfigService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomepageComponent);
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

    describe('saveOptions', () => {
        it('should set savingOptions to true then false after the timeout', (done) => {
            jasmine.clock().install();
            component.saveOptions();
            expect(component.savingOptions).toBeTrue();
            expect(component.optionsSaved).toBeFalse();

            jasmine.clock().tick(2001);
            expect(component.savingOptions).toBeFalse();
            expect(component.optionsSaved).toBeTrue();

            jasmine.clock().uninstall();
            done();
        });
    });

    describe('optionsChanged', () => {
        it('should reset saving state', () => {
            component.savingOptions = true;
            component.optionsSaved = true;
            component.optionsChanged();
            expect(component.savingOptions).toBeFalse();
            expect(component.optionsSaved).toBeFalse();
        });
    });
});
