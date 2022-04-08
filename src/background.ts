import {LookupSource} from './app/models/lookup-source.enum';
import {LookupModel} from './app/models/lookup.model';
import { Observable } from 'rxjs';
import { OptionsModel, OptionsModelKeys } from './app/models/options.model';
import {ConfigModel} from './app/models/config.model';
import * as c from './config.json';

var options = null;
var glossaryName = "glossary.json";
var config = c;

initializeOptions();

export function openDefaultEmailAddress(email: string): void{
    const mailtoPath = 'mailto:' + email;

    chrome.tabs.create({'url': mailtoPath}, function (tab) {
        setTimeout(function () {
            chrome.tabs.remove(tab.id);
        }, 500);
    });
}

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
                let popupHTML = "<div class=\"lookup-popup\">";

                if(definitions.length === 0){
                    popupHTML += "<div><p>No definition found</p></div>"
                }
                else{
                    popupHTML += "<ol>";
                    for(const def of definitions){
                        popupHTML += "<li><p>"+def.definition+"</p><ul>";

                        for(const link of def.links){
                            popupHTML += "<li>"+link.name+": ";
                            popupHTML += "<a href="+link.link+" target=\"_blank\" rel=\"noopener noreferrer\">";
                            popupHTML += link.link+"</a></li>";
                        }
                        popupHTML += "</ul></li>";
                    }

                    popupHTML += "</ol>";
                }

                popupHTML += "</div>";

                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        command: 'lookupElement',
                        element: popupHTML,
                        coord: data.coord
                    });
                });
            }
        }
    )
}

function lookupTerm(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
    console.log('Acronym Decoder is looking up: ' + searchTerm);
    if(config.enableRemoteLookup){
        return lookupTermRemotely(searchTerm, source);
    }
    else{
        return lookupTermLocally(searchTerm, source);
    }
}

function lookupTermRemotely(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
    const lookupURL = config.lookupApiUrl + searchTerm + "&dep=false";

    return new Observable(observer => {
        fetch(lookupURL)
        .then(response => response.json())
        .then(definitions => {
            console.log('Search results (remotely): ', definitions);
            observer.next(definitions);
        });
    });
}

function lookupTermLocally(searchTerm: string, source: LookupSource): Observable<LookupModel[]> {
    return new Observable(observer => {
        fetch(glossaryName)
        .then(response => response.json())
        .then(glossary => {
            const definitions = glossary.filter(termObj =>
                termObj.acronym.toLowerCase() === searchTerm.toLowerCase()
            );
            console.log('Search results (locally): ', definitions);
            observer.next(definitions);
        });
    });
}

function initializeOptions(){
    chrome.storage.local.get(OptionsModelKeys,
        (results) => {
            options = new OptionsModel(results);
        }
    );

    chrome.storage.onChanged.addListener(
        (changes) => {
            console.log('Acronym Decoder options changed', changes);
            for(const key in changes){
                if(OptionsModelKeys.indexOf(key) > -1){
                    options[key] = changes[key].newValue;
                }
            }
        }
    );
}