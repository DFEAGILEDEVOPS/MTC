import { TestBed } from '@angular/core/testing';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { StorageService } from '../storage/storage.service';
import { TokenService } from './token.service';

let tokenService: TokenService;
let mockStorageService: StorageServiceMock;

describe('TokenService', () => {
  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    const inject = TestBed.configureTestingModule({
        providers: [
          TokenService,
          {provide: StorageService, useValue: mockStorageService}
        ]
      }
    );
    tokenService = inject.get(TokenService);
  });
  it('should be created', () => {
    expect(tokenService).toBeTruthy();
  });
});
