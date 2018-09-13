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
  it('getToken should fetch the tokens using storage service', () => {
    spyOn(mockStorageService, 'getItem').and.returnValue({ 'check-started': { token: 'token', url: 'url'} });
    const checkStartedToken = tokenService.getToken('check-started');
    expect (checkStartedToken).toEqual({ token: 'token', url: 'url'});
  });
});
