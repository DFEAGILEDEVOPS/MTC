import { PupilSpaPage } from './app.po';

describe('pupil-spa App', () => {
  let page: PupilSpaPage;

  beforeEach(() => {
    page = new PupilSpaPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
