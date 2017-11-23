
export class SubmissionServiceMock {
  async submitData() {
    Promise.resolve('OK');
  }
  async submitCheckStartData() {
    Promise.resolve('OK');
  }
}
