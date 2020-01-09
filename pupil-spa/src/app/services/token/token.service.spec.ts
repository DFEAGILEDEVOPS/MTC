import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { TokenService } from './token.service';

let tokenService: TokenService;
let storageService: StorageService;

describe('TokenService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          TokenService,
          StorageService
        ]
      }
    );
    tokenService = inject.get(TokenService);
    storageService = inject.get(StorageService);
  });
  it('should be created', () => {
    expect(tokenService).toBeTruthy();
  });
  it('getToken should fetch the tokens using storage service', () => {
    spyOn(storageService, 'getToken').and.returnValue({ 'check-started': { token: 'token', url: 'url'} });
    const checkStartedToken = tokenService.getToken('check-started');
    expect (checkStartedToken).toEqual({ token: 'token', url: 'url'});
  });
});
