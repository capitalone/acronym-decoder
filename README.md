

## Drinketh from the Cup of Knowledge!
Whether you've been with your organization one day or one decade, we are all always running into terms and acronyms that we just don't get. Maybe it's an industry or line of business you're not too familiar with. Maybe it's an acronym that someone just made up and started using the other day. Maybe it's a typo!

Whatever it is, Acronym-Decoder (A-D!) aims to help you get through the alphabet soup. It's a fairly simple tool that highlights words that you have a definition for, then lets you pull up those definition(s) with a click of the mouse.


## Run Local Server

* `npm install`
* `gulp`
* Visit `chrome://extensions` on your chrome browser
* Enable Developer mode
* Load unpacked and select the `dist/` folder in the project

Note: modifications to content-script files will require you to refresh the extension from [chrome://extensions](chrome://extensions)

## Build

* `npm install`
* `gulp build`

## Configuration

All of the configurable variables live within the [config.json](https://github.com/capitalone/acronym-decoder/blob/master/src/config.json) file. Change each property depending on your specific need to shape how the app will look and function. The changes you make here will propogate throughout the app.

## Setting up your terms and acronyms

### Local Glossary: 
You can set up your terms and acronyms by inserting them into the `glossary.json` file.
The format of the file should stay the same as the example that lives in there currently. Make sure all your terms and acronyms match that format so the app can read them with no issues. 

### Remote Glossary:
You can also setup a database and backend and host your terms/acronyms on a server. This feature is off by default. 
Make sure to replace the `lookupApiUrl` in the `config.json` file with the server URL.
Also you need to make sure that the toggle for `enableRemoteLookup` is set to `true` on the `config.json` file to enable remote lookup. If for any reason the API fails, the app will fallback to local glossary.


## Troubleshooting
* Having issues installing Acronym-Decoder?
* Or for any other problems/questions:

Create an issue on our repo and let us know. We're always here to help!

## Licence

    Copyright 2016 Capital One Services, LLC

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
