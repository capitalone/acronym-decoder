import { of } from 'rxjs';
import { ConfigurationService } from '../app/core/configuration/configuration.service';
import { ConfigModel } from '../app/models/config.model';

export function createConfigServiceSpy(
    config: ConfigModel,
    version = '1.0.0'
): jasmine.SpyObj<ConfigurationService> {
    const spy = jasmine.createSpyObj<ConfigurationService>(
        'ConfigurationService',
        ['getConfiguration', 'getExtensionVersion']
    );
    spy.getConfiguration.and.returnValue(of(config));
    spy.getExtensionVersion.and.returnValue(of(version));
    return spy;
}

export function itLoadsConfigAndVersion(
    getComponent: () => { config: ConfigModel; extensionVersion: string },
    getMockConfigService: () => jasmine.SpyObj<ConfigurationService>,
    expectedConfig: ConfigModel
): void {
    it('should populate config on init', () => {
        expect(getMockConfigService().getConfiguration).toHaveBeenCalled();
        expect(getComponent().config).toEqual(expectedConfig);
    });

    it('should populate extension version on init', () => {
        expect(getMockConfigService().getExtensionVersion).toHaveBeenCalled();
        expect(getComponent().extensionVersion).toBe('1.0.0');
    });
}
