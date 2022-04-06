import { ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import {LookupSource} from './app/models/lookup-source.enum';
import {LookupModel} from './app/models/lookup.model';
import { Observable } from 'rxjs';
import { OptionsModel, OptionsModelKeys } from './app/models/options.model';

var options = null;

chrome.storage.local.get(OptionsModelKeys,
    (results) => {
        options = new OptionsModel(results);
    }
);

chrome.storage.onChanged.addListener(
    (changes, namespace) => {
        console.log('Acronym Decoder options changed', changes);
        for(const key in changes){
            if(OptionsModelKeys.indexOf(key) > -1){
                options[key] = changes[key].newValue;
            }
        }
    }
);

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    switch(data.command){
        case 'lookup': {
            console.log('Received command: ' + data.command);
            console.log('Looking up!', data.query);
            generateLookup(data);
            sendResponse('success');
            break;
        }
        default: {
            console.log('Unknown command detected!');
            break;
        }
    }
});

function generateLookup(data){
    lookupTerm(data.query, LookupSource.lookup).subscribe(
        (definitions: LookupModel[]) => {
            if(definitions.length > 0 || options.notFoundDialog){
                const component = 
            }
        }
    )
}

function lookupTerm(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
    console.log('Acronym Decoder is looking up: ' + searchTerm);
    return lookupTermLocally(searchTerm, source);
}

function lookupTermLocally(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
    fetch("glossary.json")
    .then(response => response.json())
    .then(glossary => {
        return new Observable(observer => {
            const definitions = glossary.filter(termObj => 
                termObj.acronym.toLowerCase() === searchTerm.toLowerCase()
            );
            
            console.log('Search results (locally): ', definitions);
            observer.next(definitions);
        })
    });

    return null;
}