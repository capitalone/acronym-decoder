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
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ConfigModel} from '../../models/config.model';

@Injectable()
export class ConfigurationService {

    static isBackendOnline: boolean;

    // file names for chrome assets
    manifestFileName = 'manifest.json';
    configFileName = 'config.json';

    manifest: any;
    config: ConfigModel;


    constructor(private http: HttpClient) {
        ConfigurationService.isBackendOnline = true;
    }

    getJsonFileContent(fileName: string): Observable<any> {
        return this.http.get(chrome.extension.getURL(fileName));
    }

    getExtensionVersion(): Observable<string> {
        return Observable.create(observer => {
            if (this.manifest) {
                observer.next(this.manifest.version);
            } else {
                this.getJsonFileContent(this.manifestFileName)
                    .subscribe(manifest => {
                        this.manifest = manifest;
                        observer.next(manifest.version);
                    });
            }
        });
    }

    getConfiguration(): Observable<ConfigModel> {
        return Observable.create(observer => {
            if (this.config) {
                observer.next(this.config);
            } else {
                this.getJsonFileContent(this.configFileName)
                    .subscribe((config: ConfigModel) => {
                        this.config = config;
                        observer.next(config);
                    });
            }
        });
    }

}
