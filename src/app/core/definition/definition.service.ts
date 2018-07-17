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

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {ConfigurationService} from '../configuration/configuration.service';
import 'rxjs/add/operator/map';
import {AnalyticsService} from '../analytics/analytics.service';
import {LookupModel} from '../../models/lookup.model';
import {ConfigModel} from '../../models/config.model';
import {DatabaseType} from '../../models/database-type.enum';
import {LookupApiResponseModel} from '../../models/lookup-api-response.model';
import {LookupSource} from '../../models/lookup-source.enum';
import 'rxjs/add/operator/timeout';


@Injectable()
export class DefinitionService {

    // file names for chrome assets
    glossaryFileName = 'glossary.json';
    previousSearchTerm: string;
    config: ConfigModel;


    constructor(private configurationService: ConfigurationService,
                private analyticsService: AnalyticsService,
                private http: HttpClient) {
        this.populateConfiguration();
    }

    /**
     * Populates the configuration
     */
    populateConfiguration(): void {
        this.configurationService.getConfiguration().subscribe(
            (config: ConfigModel) => {
                this.config = config;
            }
        );
    }

    /**
     * Routes the searching method by checking if the remote lookup is enabled or not
     *
     * @param {string} searchTerm
     * @param {LookupSource} source - used for analytics. It can be the popup search or on screen search
     * @returns {Observable<LookupModel[]>}
     */
    lookupTerm(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
        console.log('Acronym Decoder is looking up: ' + searchTerm);

        if (this.config.enableRemoteLookup) {
            return this.lookupTermRemotely(searchTerm, source);
        } else {
            return this.lookupTermLocally(searchTerm, source);
        }
    }

    /**
     * Looks up the searched term from the local glossary file and returns it to the observable
     *
     * @param {string} searchTerm
     * @param {LookupSource} source - used for analytics. It can be the popup search or on screen search
     * @returns {Observable<LookupModel[]>}
     */
    lookupTermLocally(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
        return Observable.create(observer => {
            this.configurationService.getJsonFileContent(this.glossaryFileName)
                .subscribe(glossary => {
                    this.previousSearchTerm = searchTerm;
                    const definitions = glossary.filter(termObj =>
                        termObj.acronym.toLowerCase() === searchTerm.toLowerCase()
                    );
                    this.gaLookupEvent(source, DatabaseType.local, searchTerm, definitions.length);

                    console.log('Search results (locally): ', definitions);
                    observer.next(definitions);
                });
        });
    }

    /**
     * Looks up the searched term by calling the lookup API and returns it to the observable
     * If there's an issue with the API call, it will fallback to searching locally
     *
     * @param {string} searchTerm
     * @param {LookupSource} source
     * @returns {Observable<LookupModel[]>}
     */
    lookupTermRemotely(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
        const lookupUrl = this.config.lookupApiUrl + searchTerm;

        return Observable.create(observer => {
            this.http.get<LookupApiResponseModel>(lookupUrl)
                .timeout(3000)
                .subscribe(
                    (res: LookupApiResponseModel) => {
                        console.log('Search results (remotely): ', res);
                        ConfigurationService.isBackendOnline = true;
                        this.gaLookupEvent(source, DatabaseType.server, searchTerm, res.data.length);
                        observer.next(res.data);
                    },
                    error => {
                        console.log('Http Client error: ', error);
                        ConfigurationService.isBackendOnline = false;

                        // Remote call failed, so fallback to local search
                        this.lookupTermLocally(searchTerm, source).subscribe(
                            localRes => {
                                observer.next(localRes);
                            }
                        );
                    });
        });
    }

    /**
     * Fires Google Analytics event
     *
     * @param {LookupSource} lookupSource
     * @param {DatabaseType} databaseType
     * @param {string} term
     * @param {number} numResults
     */
    gaLookupEvent(lookupSource: LookupSource, databaseType: DatabaseType, term: string, numResults: number) {
        if (this.config.googleAnalyticsEnabled) {
            this.analyticsService.getVisitor().event(lookupSource, databaseType, term, numResults).send();
        }
    }

}
