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

import {Injectable} from '@angular/core';
import {Visitor} from 'universal-analytics';

import * as UA from 'universal-analytics';
import {ConfigurationService} from '../configuration/configuration.service';
import {ConfigModel} from '../../models/config.model';

@Injectable()
export class AnalyticsService {

    private config: ConfigModel;
    private visitor: Visitor;

    constructor(private configurationService: ConfigurationService) {
        // We can track individual users by giving a UUID as the second parameter while creating the visitor.
        // Without UUID, visitor acts like a "guest" or anonymous user.
        this.configurationService.getConfiguration().subscribe(
            (config: ConfigModel) => {
                this.config = config;
                if (this.config.googleAnalyticsEnabled) {
                    this.visitor = UA(this.config.googleAnalyticsId);
                }
            }
        );
    }

    getVisitor(): Visitor {
        return this.visitor;
    }

}
