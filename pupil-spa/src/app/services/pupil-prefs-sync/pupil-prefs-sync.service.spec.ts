import { TestBed } from '@angular/core/testing';

import { AccessArrangements } from '../../access-arrangements';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { PupilPrefsSyncService } from './pupil-prefs-sync.service';

describe('PupilPrefsSyncService', () => {
  let mockStorageService;
  let pupilPrefsSyncService;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: StorageServiceMock },
        PupilPrefsSyncService,
      ]
    });
    mockStorageService = injector.get(StorageService);
    pupilPrefsSyncService = injector.get(PupilPrefsSyncService);
  });
  it('PupilPrefsSyncService should be created', () => {
    expect(pupilPrefsSyncService).toBeTruthy();
  });
  it('should sync prefs from local storage access_arrangements key and return', () => {
    spyOn(mockStorageService, 'getItem').and.returnValue({ contrast: 'bow', fontSize: 'regular' });
    const accessArrangements = new AccessArrangements();
    accessArrangements.fontSize = 'regular';
    accessArrangements.contrast = 'bow';
    pupilPrefsSyncService.sync();
    expect(mockStorageService.getItem).toHaveBeenCalledTimes(1);
    expect(pupilPrefsSyncService.accessArrangements).toEqual(accessArrangements);
  });
  it('should sync prefs from local storage config key', () => {
    spyOn(mockStorageService, 'getItem').and.returnValues(undefined, { colourContrastCode: 'BOB', fontSizeCode: 'SML' });
    const accessArrangements = new AccessArrangements();
    accessArrangements.fontSize = 'small';
    accessArrangements.contrast = 'bob';
    pupilPrefsSyncService.sync();
    expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
    expect(pupilPrefsSyncService.accessArrangements).toEqual(accessArrangements);
  });
  it('should provide defaults if local storage does not provide existing values', () => {
    spyOn(mockStorageService, 'getItem').and.returnValues(undefined, undefined);
    const accessArrangements = new AccessArrangements();
    accessArrangements.fontSize = 'regular';
    accessArrangements.contrast = 'bow';
    pupilPrefsSyncService.sync();
    expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
    expect(pupilPrefsSyncService.accessArrangements).toEqual(accessArrangements);
  });
});
