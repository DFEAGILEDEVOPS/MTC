import { TestBed } from '@angular/core/testing';

import { AccessArrangements, AccessArrangementsConfig, accessArrangementsDataKey } from '../../access-arrangements';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { SyncAccessArrangementsService } from './sync-access-arrangements.service';

describe('PupilPrefsService', () => {
  let mockStorageService;
  let syncAccessArrangementsService;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: StorageServiceMock },
        SyncAccessArrangementsService,
      ]
    });
    mockStorageService = injector.get(StorageService);
    syncAccessArrangementsService = injector.get(SyncAccessArrangementsService);
    spyOn(mockStorageService, 'getItem').and.returnValue({ colourContrastCode: 'BOW', fontSizeCode: 'RGL'} );
  });
  it('SyncAccessArrangementsService should be created', () => {
    expect(syncAccessArrangementsService).toBeTruthy();
  });
});
