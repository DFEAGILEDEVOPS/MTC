'use strict'
/* global describe it expect spyOn beforeEach */

const tableEls = `
  <table id="pinSlips" class="govuk-table">
      <tbody>
      <tr class="page pupil-12">
          <td class="line-empty"></td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-content">
  
              <div class="pupil-content">
                              <span class="fullname">Juliana  Brewer
                                  
                                      (alpha)
                                  
                              </span>
  
              </div>
              <div class="pin-content">
                  <span class="pin-text">School Password:</span>
                  <span class="pin-information">bxx27aaa</span>
                  <span class="separator"></span>
                  <label class="pin-text">PIN:</label>
                  <span class="pin-information">7577</span>
              </div>
  
              <div class="qr"><img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOhSURBVO3BQapjRwAEwaxG979yehYG18YND0nf46Ei4i/M/O0wUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXrwpCT9J5Ykk3Ki0JNyoPJGEn6TyjsNMOcyUw0x58WEqn5SEd6jcJOFGpSWhqTyh8klJ+KTDTDnMlMNMefFlSXhC5YkkNJUnVN6RhKbyRBKeUPmmw0w5zJTDTHnxh0nCjcr8u8NMOcyUw0x58YdTuUlCU2lJaCotCX+Sw0w5zJTDTHnxZSq/kyQ0lRuVloRPUvmdHGbKYaYcZsqLD0vCf0mlJaGptCQ0lZaEptKS8EQSfmeHmXKYKYeZEn/hfywJTaUl4UZl/nGYKYeZcpgpL96UhKbSkvBJKk2lJeFGpSWhqdwk4UalJeGTVL7pMFMOM+UwU168SeUJlZskNJWWhKZyo9KS0FRuktBUWhJuVFoSmsoTSWgqn3SYKYeZcpgp8Rc+KAlN5SYJTaUloam0JDSVb0rCEypPJKGptCTcqLzjMFMOM+UwU158WRKaSlNpSWgq70jCjUpLwo1KS8ITSbhRuVFpSfikw0w5zJTDTHnxYSotCe9IQlNpKi0JTaUl4QmVG5WWhJaEptKScJOEn3SYKYeZcpgpL96UhKZyk4SmcqPSktBUmkpLQlNpSWgqTyShqdwkoam0JDSVloSm8kmHmXKYKYeZ8uI/loSm0pLQVD5J5SYJNyo3SbhJwjuS0FTecZgph5lymCkvfjNJaCotCU3lRuUmCU2lqbQk3CShqbQk3KjcqLQkfNJhphxmymGmvPjNJeEmCU3lm1RaEm6S8I4kNJWm8kmHmXKYKYeZEn/hfywJTeWbknCj8kQSblR+0mGmHGbKYaa8eFMSfpJKU7lJwhMqNyotCTdJaCo3Ki0JT6i84zBTDjPlMFNefJjKJyXhJglN5QmVb1J5IglN5ScdZsphphxmyosvS8ITKp+k0pLwjiTcJOEdKi0JTaUloam84zBTDjPlMFNe/GGS0FSaSkvCjcqNSkvCjUpLQkvCTRK+6TBTDjPlMFNe/OGS0FSaSktCS0JTaUloKk+otCTcqLQkfNJhphxmymGmvPgylW9SaUl4Igk3Ki0JTyThHSo/6TBTDjPlMFNefFgSflISmkpLwhMqLQlN5SYJn5SEn3SYKYeZcpgp8Rdm/naYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgpfwFJnaEcU95vGgAAAABJRU5ErkJggg==">
              </div>
  
              <div class="url">https://localhost:4200</div>
          </td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-empty"></td>
      </tr>
  
      <tr class="page pupil-5">
          <td class="line-empty"></td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-content">
  
              <div class="pupil-content">
                              <span class="fullname">Koch  Hobbs
                                  
                                      (alpha)
                                  
                              </span>
  
              </div>
              <div class="pin-content">
                  <span class="pin-text">School Password:</span>
                  <span class="pin-information">bxx27aaa</span>
                  <span class="separator"></span>
                  <label class="pin-text">PIN:</label>
                  <span class="pin-information">3592</span>
              </div>
  
              <div class="qr"><img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOhSURBVO3BQapjRwAEwaxG979yehYG18YND0nf46Ei4i/M/O0wUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXrwpCT9J5Ykk3Ki0JNyoPJGEn6TyjsNMOcyUw0x58WEqn5SEd6jcJOFGpSWhqTyh8klJ+KTDTDnMlMNMefFlSXhC5YkkNJUnVN6RhKbyRBKeUPmmw0w5zJTDTHnxh0nCjcr8u8NMOcyUw0x58YdTuUlCU2lJaCotCX+Sw0w5zJTDTHnxZSq/kyQ0lRuVloRPUvmdHGbKYaYcZsqLD0vCf0mlJaGptCQ0lZaEptKS8EQSfmeHmXKYKYeZEn/hfywJTaUl4UZl/nGYKYeZcpgpL96UhKbSkvBJKk2lJeFGpSWhqdwk4UalJeGTVL7pMFMOM+UwU168SeUJlZskNJWWhKZyo9KS0FRuktBUWhJuVFoSmsoTSWgqn3SYKYeZcpgp8Rc+KAlN5SYJTaUloam0JDSVb0rCEypPJKGptCTcqLzjMFMOM+UwU158WRKaSlNpSWgq70jCjUpLwo1KS8ITSbhRuVFpSfikw0w5zJTDTHnxYSotCe9IQlNpKi0JTaUl4QmVG5WWhJaEptKScJOEn3SYKYeZcpgpL96UhKZyk4SmcqPSktBUmkpLQlNpSWgqTyShqdwkoam0JDSVloSm8kmHmXKYKYeZ8uI/loSm0pLQVD5J5SYJNyo3SbhJwjuS0FTecZgph5lymCkvfjNJaCotCU3lRuUmCU2lqbQk3CShqbQk3KjcqLQkfNJhphxmymGmvPjNJeEmCU3lm1RaEm6S8I4kNJWm8kmHmXKYKYeZEn/hfywJTeWbknCj8kQSblR+0mGmHGbKYaa8eFMSfpJKU7lJwhMqNyotCTdJaCo3Ki0JT6i84zBTDjPlMFNefJjKJyXhJglN5QmVb1J5IglN5ScdZsphphxmyosvS8ITKp+k0pLwjiTcJOEdKi0JTaUloam84zBTDjPlMFNe/GGS0FSaSkvCjcqNSkvCjUpLQkvCTRK+6TBTDjPlMFNe/OGS0FSaSktCS0JTaUloKk+otCTcqLQkfNJhphxmymGmvPgylW9SaUl4Igk3Ki0JTyThHSo/6TBTDjPlMFNefFgSflISmkpLwhMqLQlN5SYJn5SEn3SYKYeZcpgp8Rdm/naYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgpfwFJnaEcU95vGgAAAABJRU5ErkJggg==">
              </div>
  
              <div class="url">https://localhost:4200</div>
          </td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-empty"></td>
      </tr>
  
      <tr class="page pupil-9">
          <td class="line-empty"></td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-content">
  
              <div class="pupil-content">
                              <span class="fullname">Ebony  Daniels
                                  
                              </span>
  
              </div>
              <div class="pin-content">
                  <span class="pin-text">School Password:</span>
                  <span class="pin-information">bxx27aaa</span>
                  <span class="separator"></span>
                  <label class="pin-text">PIN:</label>
                  <span class="pin-information">2647</span>
              </div>
  
              <div class="qr"><img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOhSURBVO3BQapjRwAEwaxG979yehYG18YND0nf46Ei4i/M/O0wUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXrwpCT9J5Ykk3Ki0JNyoPJGEn6TyjsNMOcyUw0x58WEqn5SEd6jcJOFGpSWhqTyh8klJ+KTDTDnMlMNMefFlSXhC5YkkNJUnVN6RhKbyRBKeUPmmw0w5zJTDTHnxh0nCjcr8u8NMOcyUw0x58YdTuUlCU2lJaCotCX+Sw0w5zJTDTHnxZSq/kyQ0lRuVloRPUvmdHGbKYaYcZsqLD0vCf0mlJaGptCQ0lZaEptKS8EQSfmeHmXKYKYeZEn/hfywJTaUl4UZl/nGYKYeZcpgpL96UhKbSkvBJKk2lJeFGpSWhqdwk4UalJeGTVL7pMFMOM+UwU168SeUJlZskNJWWhKZyo9KS0FRuktBUWhJuVFoSmsoTSWgqn3SYKYeZcpgp8Rc+KAlN5SYJTaUloam0JDSVb0rCEypPJKGptCTcqLzjMFMOM+UwU158WRKaSlNpSWgq70jCjUpLwo1KS8ITSbhRuVFpSfikw0w5zJTDTHnxYSotCe9IQlNpKi0JTaUl4QmVG5WWhJaEptKScJOEn3SYKYeZcpgpL96UhKZyk4SmcqPSktBUmkpLQlNpSWgqTyShqdwkoam0JDSVloSm8kmHmXKYKYeZ8uI/loSm0pLQVD5J5SYJNyo3SbhJwjuS0FTecZgph5lymCkvfjNJaCotCU3lRuUmCU2lqbQk3CShqbQk3KjcqLQkfNJhphxmymGmvPjNJeEmCU3lm1RaEm6S8I4kNJWm8kmHmXKYKYeZEn/hfywJTeWbknCj8kQSblR+0mGmHGbKYaa8eFMSfpJKU7lJwhMqNyotCTdJaCo3Ki0JT6i84zBTDjPlMFNefJjKJyXhJglN5QmVb1J5IglN5ScdZsphphxmyosvS8ITKp+k0pLwjiTcJOEdKi0JTaUloam84zBTDjPlMFNe/GGS0FSaSkvCjcqNSkvCjUpLQkvCTRK+6TBTDjPlMFNe/OGS0FSaSktCS0JTaUloKk+otCTcqLQkfNJhphxmymGmvPgylW9SaUl4Igk3Ki0JTyThHSo/6TBTDjPlMFNefFgSflISmkpLwhMqLQlN5SYJn5SEn3SYKYeZcpgp8Rdm/naYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgpfwFJnaEcU95vGgAAAABJRU5ErkJggg==">
              </div>
  
              <div class="url">https://localhost:4200</div>
          </td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-empty"></td>
      </tr>
  
      <tr class="page pupil-16">
          <td class="line-empty"></td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-content">
  
              <div class="pupil-content">
                              <span class="fullname">Gregory  Duke
                                  
                              </span>
  
              </div>
              <div class="pin-content">
                  <span class="pin-text">School Password:</span>
                  <span class="pin-information">bxx27aaa</span>
                  <span class="separator"></span>
                  <label class="pin-text">PIN:</label>
                  <span class="pin-information">8469</span>
              </div>
  
              <div class="qr"><img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOhSURBVO3BQapjRwAEwaxG979yehYG18YND0nf46Ei4i/M/O0wUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXrwpCT9J5Ykk3Ki0JNyoPJGEn6TyjsNMOcyUw0x58WEqn5SEd6jcJOFGpSWhqTyh8klJ+KTDTDnMlMNMefFlSXhC5YkkNJUnVN6RhKbyRBKeUPmmw0w5zJTDTHnxh0nCjcr8u8NMOcyUw0x58YdTuUlCU2lJaCotCX+Sw0w5zJTDTHnxZSq/kyQ0lRuVloRPUvmdHGbKYaYcZsqLD0vCf0mlJaGptCQ0lZaEptKS8EQSfmeHmXKYKYeZEn/hfywJTaUl4UZl/nGYKYeZcpgpL96UhKbSkvBJKk2lJeFGpSWhqdwk4UalJeGTVL7pMFMOM+UwU168SeUJlZskNJWWhKZyo9KS0FRuktBUWhJuVFoSmsoTSWgqn3SYKYeZcpgp8Rc+KAlN5SYJTaUloam0JDSVb0rCEypPJKGptCTcqLzjMFMOM+UwU158WRKaSlNpSWgq70jCjUpLwo1KS8ITSbhRuVFpSfikw0w5zJTDTHnxYSotCe9IQlNpKi0JTaUl4QmVG5WWhJaEptKScJOEn3SYKYeZcpgpL96UhKZyk4SmcqPSktBUmkpLQlNpSWgqTyShqdwkoam0JDSVloSm8kmHmXKYKYeZ8uI/loSm0pLQVD5J5SYJNyo3SbhJwjuS0FTecZgph5lymCkvfjNJaCotCU3lRuUmCU2lqbQk3CShqbQk3KjcqLQkfNJhphxmymGmvPjNJeEmCU3lm1RaEm6S8I4kNJWm8kmHmXKYKYeZEn/hfywJTeWbknCj8kQSblR+0mGmHGbKYaa8eFMSfpJKU7lJwhMqNyotCTdJaCo3Ki0JT6i84zBTDjPlMFNefJjKJyXhJglN5QmVb1J5IglN5ScdZsphphxmyosvS8ITKp+k0pLwjiTcJOEdKi0JTaUloam84zBTDjPlMFNe/GGS0FSaSkvCjcqNSkvCjUpLQkvCTRK+6TBTDjPlMFNe/OGS0FSaSktCS0JTaUloKk+otCTcqLQkfNJhphxmymGmvPgylW9SaUl4Igk3Ki0JTyThHSo/6TBTDjPlMFNefFgSflISmkpLwhMqLQlN5SYJn5SEn3SYKYeZcpgp8Rdm/naYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgpfwFJnaEcU95vGgAAAABJRU5ErkJggg==">
              </div>
  
              <div class="url">https://localhost:4200</div>
          </td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-empty"></td>
      </tr>
  
      <tr class="page pupil-13">
          <td class="line-empty"></td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-content">
  
              <div class="pupil-content">
                              <span class="fullname">Nieves  Dunn
                                  
                              </span>
  
              </div>
              <div class="pin-content">
                  <span class="pin-text">School Password:</span>
                  <span class="pin-information">bxx27aaa</span>
                  <span class="separator"></span>
                  <label class="pin-text">PIN:</label>
                  <span class="pin-information">8736</span>
              </div>
  
              <div class="qr"><img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOhSURBVO3BQapjRwAEwaxG979yehYG18YND0nf46Ei4i/M/O0wUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXrwpCT9J5Ykk3Ki0JNyoPJGEn6TyjsNMOcyUw0x58WEqn5SEd6jcJOFGpSWhqTyh8klJ+KTDTDnMlMNMefFlSXhC5YkkNJUnVN6RhKbyRBKeUPmmw0w5zJTDTHnxh0nCjcr8u8NMOcyUw0x58YdTuUlCU2lJaCotCX+Sw0w5zJTDTHnxZSq/kyQ0lRuVloRPUvmdHGbKYaYcZsqLD0vCf0mlJaGptCQ0lZaEptKS8EQSfmeHmXKYKYeZEn/hfywJTaUl4UZl/nGYKYeZcpgpL96UhKbSkvBJKk2lJeFGpSWhqdwk4UalJeGTVL7pMFMOM+UwU168SeUJlZskNJWWhKZyo9KS0FRuktBUWhJuVFoSmsoTSWgqn3SYKYeZcpgp8Rc+KAlN5SYJTaUloam0JDSVb0rCEypPJKGptCTcqLzjMFMOM+UwU158WRKaSlNpSWgq70jCjUpLwo1KS8ITSbhRuVFpSfikw0w5zJTDTHnxYSotCe9IQlNpKi0JTaUl4QmVG5WWhJaEptKScJOEn3SYKYeZcpgpL96UhKZyk4SmcqPSktBUmkpLQlNpSWgqTyShqdwkoam0JDSVloSm8kmHmXKYKYeZ8uI/loSm0pLQVD5J5SYJNyo3SbhJwjuS0FTecZgph5lymCkvfjNJaCotCU3lRuUmCU2lqbQk3CShqbQk3KjcqLQkfNJhphxmymGmvPjNJeEmCU3lm1RaEm6S8I4kNJWm8kmHmXKYKYeZEn/hfywJTeWbknCj8kQSblR+0mGmHGbKYaa8eFMSfpJKU7lJwhMqNyotCTdJaCo3Ki0JT6i84zBTDjPlMFNefJjKJyXhJglN5QmVb1J5IglN5ScdZsphphxmyosvS8ITKp+k0pLwjiTcJOEdKi0JTaUloam84zBTDjPlMFNe/GGS0FSaSkvCjcqNSkvCjUpLQkvCTRK+6TBTDjPlMFNe/OGS0FSaSktCS0JTaUloKk+otCTcqLQkfNJhphxmymGmvPgylW9SaUl4Igk3Ki0JTyThHSo/6TBTDjPlMFNefFgSflISmkpLwhMqLQlN5SYJn5SEn3SYKYeZcpgp8Rdm/naYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgpfwFJnaEcU95vGgAAAABJRU5ErkJggg==">
              </div>
  
              <div class="url">https://localhost:4200</div>
          </td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-empty"></td>
      </tr>
  
      <tr class="page pupil-14">
          <td class="line-empty"></td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-content">
  
              <div class="pupil-content">
                              <span class="fullname">Burns  Flowers
                                  
                              </span>
  
              </div>
              <div class="pin-content">
                  <span class="pin-text">School Password:</span>
                  <span class="pin-information">bxx27aaa</span>
                  <span class="separator"></span>
                  <label class="pin-text">PIN:</label>
                  <span class="pin-information">2495</span>
              </div>
  
              <div class="qr"><img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOhSURBVO3BQapjRwAEwaxG979yehYG18YND0nf46Ei4i/M/O0wUw4z5TBTDjPlMFMOM+UwUw4z5TBTDjPlMFMOM+UwUw4z5TBTXrwpCT9J5Ykk3Ki0JNyoPJGEn6TyjsNMOcyUw0x58WEqn5SEd6jcJOFGpSWhqTyh8klJ+KTDTDnMlMNMefFlSXhC5YkkNJUnVN6RhKbyRBKeUPmmw0w5zJTDTHnxh0nCjcr8u8NMOcyUw0x58YdTuUlCU2lJaCotCX+Sw0w5zJTDTHnxZSq/kyQ0lRuVloRPUvmdHGbKYaYcZsqLD0vCf0mlJaGptCQ0lZaEptKS8EQSfmeHmXKYKYeZEn/hfywJTaUl4UZl/nGYKYeZcpgpL96UhKbSkvBJKk2lJeFGpSWhqdwk4UalJeGTVL7pMFMOM+UwU168SeUJlZskNJWWhKZyo9KS0FRuktBUWhJuVFoSmsoTSWgqn3SYKYeZcpgp8Rc+KAlN5SYJTaUloam0JDSVb0rCEypPJKGptCTcqLzjMFMOM+UwU158WRKaSlNpSWgq70jCjUpLwo1KS8ITSbhRuVFpSfikw0w5zJTDTHnxYSotCe9IQlNpKi0JTaUl4QmVG5WWhJaEptKScJOEn3SYKYeZcpgpL96UhKZyk4SmcqPSktBUmkpLQlNpSWgqTyShqdwkoam0JDSVloSm8kmHmXKYKYeZ8uI/loSm0pLQVD5J5SYJNyo3SbhJwjuS0FTecZgph5lymCkvfjNJaCotCU3lRuUmCU2lqbQk3CShqbQk3KjcqLQkfNJhphxmymGmvPjNJeEmCU3lm1RaEm6S8I4kNJWm8kmHmXKYKYeZEn/hfywJTeWbknCj8kQSblR+0mGmHGbKYaa8eFMSfpJKU7lJwhMqNyotCTdJaCo3Ki0JT6i84zBTDjPlMFNefJjKJyXhJglN5QmVb1J5IglN5ScdZsphphxmyosvS8ITKp+k0pLwjiTcJOEdKi0JTaUloam84zBTDjPlMFNe/GGS0FSaSkvCjcqNSkvCjUpLQkvCTRK+6TBTDjPlMFNe/OGS0FSaSktCS0JTaUloKk+otCTcqLQkfNJhphxmymGmvPgylW9SaUl4Igk3Ki0JTyThHSo/6TBTDjPlMFNefFgSflISmkpLwhMqLQlN5SYJn5SEn3SYKYeZcpgp8Rdm/naYKYeZcpgph5lymCmHmXKYKYeZcpgph5lymCmHmXKYKYeZcpgpfwFJnaEcU95vGgAAAABJRU5ErkJggg==">
              </div>
  
              <div class="url">https://localhost:4200</div>
          </td>
          <td class="line-checktype live">
              <div>Official</div>
          </td>
          <td class="line-empty"></td>
      </tr>
  
      </tbody>
  </table>

  <table class="govuk-table govuk-spacious" id="generatePins" name="filterablePupislList" role="listbox" aria-label="Select pupils.">
      <thead class="govuk-table__head">
      <tr class="govuk-table__row">
          <th scope="col" class="govuk-table__header govuk-!-width-three-quarters">
              <a class="no-underline sortingLink">Pupil<span class="sort-icon"><span>Sort by pupil</span></span></a>
          </th>
          <th scope="col" class="govuk-table__header govuk-!-width-one-quarter">
              <a class="no-underline sortingLink">Group<span class="sort-icon asc"><span>Sort by group</span></span></a>
          </th>
          <td>
              <div class="tick-all-checkboxes-wrapper">
                  <label class="tick-all-checkboxes" id="selectAll" for="tickAllCheckboxes">Select all</label>
                  <label class="tick-all-checkboxes all-hide" id="deselectAll" for="tickAllCheckboxes">Deselect all</label>
                  <div class="multiple-choice-mtc">
                      <input id="tickAllCheckboxes" class="govuk-checkboxes__input" name="allPupils" type="checkbox" aria-label="Select all pupils.">
                      <div></div>
                  </div>
              </div>
          </td>
      </tr>
      </thead>
      <tbody>
  
      <tr rowid="0" class="govuk-table__row  group-id-1">
          <td>
              <label class="govuk-label" for="pupil-12">
                  <strong id="pupilName">Brewer, Juliana</strong>
  
                  (alpha)
  
              </label>
  
              <input type="hidden" id="pupilUpn" name="pupilUpn" value="G801200001010">
              <div>
                  <div class="pin-content">
                      <span class="label">School Password: </span>
                      <span class="information">bxx27aaa</span>
                      <span class="separator"></span>
                      <span class="label">PIN: </span>
                      <span class="information">
                                            7577
                                        </span>
                  </div>
              </div>
          </td>
          <td class="govuk-table__cell">alpha</td>
          <td>
              <div class="multiple-choice-mtc">
                  <input id="pupil-12" name="pupil[]" type="checkbox" value="12" aria-label="Tick pupil Brewer, Juliana." aria-checked="false" role="checkbox">
                  <div></div>
              </div>
          </td>
      </tr>
  
      <tr rowid="1" class="govuk-table__row  group-id-1">
          <td>
              <label class="govuk-label" for="pupil-5">
                  <strong id="pupilName">Hobbs, Koch</strong>
  
                  (alpha)
  
              </label>
  
              <input type="hidden" id="pupilUpn" name="pupilUpn" value="L801200001003">
              <div>
                  <div class="pin-content">
                      <span class="label">School Password: </span>
                      <span class="information">bxx27aaa</span>
                      <span class="separator"></span>
                      <span class="label">PIN: </span>
                      <span class="information">
                                            3592
                                        </span>
                  </div>
              </div>
          </td>
          <td class="govuk-table__cell">alpha</td>
          <td>
              <div class="multiple-choice-mtc">
                  <input id="pupil-5" name="pupil[]" type="checkbox" value="5" aria-label="Tick pupil Hobbs, Koch." aria-checked="false" role="checkbox">
                  <div></div>
              </div>
          </td>
      </tr>
  
      <tr rowid="2" class="govuk-table__row ">
          <td>
              <label class="govuk-label" for="pupil-9">
                  <strong id="pupilName">Daniels, Ebony</strong>
  
              </label>
  
              <input type="hidden" id="pupilUpn" name="pupilUpn" value="T801200001007">
              <div>
                  <div class="pin-content">
                      <span class="label">School Password: </span>
                      <span class="information">bxx27aaa</span>
                      <span class="separator"></span>
                      <span class="label">PIN: </span>
                      <span class="information">
                                            2647
                                        </span>
                  </div>
              </div>
          </td>
          <td class="govuk-table__cell"></td>
          <td>
              <div class="multiple-choice-mtc">
                  <input id="pupil-9" name="pupil[]" type="checkbox" value="9" aria-label="Tick pupil Daniels, Ebony." aria-checked="false" role="checkbox">
                  <div></div>
              </div>
          </td>
      </tr>
  
      <tr rowid="3" class="govuk-table__row ">
          <td>
              <label class="govuk-label" for="pupil-16">
                  <strong id="pupilName">Duke, Gregory</strong>
  
              </label>
  
              <input type="hidden" id="pupilUpn" name="pupilUpn" value="N801200001014">
              <div>
                  <div class="pin-content">
                      <span class="label">School Password: </span>
                      <span class="information">bxx27aaa</span>
                      <span class="separator"></span>
                      <span class="label">PIN: </span>
                      <span class="information">
                                            8469
                                        </span>
                  </div>
              </div>
          </td>
          <td class="govuk-table__cell"></td>
          <td>
              <div class="multiple-choice-mtc">
                  <input id="pupil-16" name="pupil[]" type="checkbox" value="16" aria-label="Tick pupil Duke, Gregory." aria-checked="false" role="checkbox">
                  <div></div>
              </div>
          </td>
      </tr>
  
      <tr rowid="4" class="govuk-table__row ">
          <td>
              <label class="govuk-label" for="pupil-13">
                  <strong id="pupilName">Dunn, Nieves</strong>
  
              </label>
  
              <input type="hidden" id="pupilUpn" name="pupilUpn" value="W801200001011">
              <div>
                  <div class="pin-content">
                      <span class="label">School Password: </span>
                      <span class="information">bxx27aaa</span>
                      <span class="separator"></span>
                      <span class="label">PIN: </span>
                      <span class="information">
                                            8736
                                        </span>
                  </div>
              </div>
          </td>
          <td class="govuk-table__cell"></td>
          <td>
              <div class="multiple-choice-mtc">
                  <input id="pupil-13" name="pupil[]" type="checkbox" value="13" aria-label="Tick pupil Dunn, Nieves." aria-checked="false" role="checkbox">
                  <div></div>
              </div>
          </td>
      </tr>
  
      <tr rowid="5" class="govuk-table__row ">
          <td>
              <label class="govuk-label" for="pupil-14">
                  <strong id="pupilName">Flowers, Burns</strong>
  
              </label>
  
              <input type="hidden" id="pupilUpn" name="pupilUpn" value="K801200001012">
              <div>
                  <div class="pin-content">
                      <span class="label">School Password: </span>
                      <span class="information">bxx27aaa</span>
                      <span class="separator"></span>
                      <span class="label">PIN: </span>
                      <span class="information">
                                            2495
                                        </span>
                  </div>
              </div>
          </td>
          <td class="govuk-table__cell"></td>
          <td>
              <div class="multiple-choice-mtc">
                  <input id="pupil-14" name="pupil[]" type="checkbox" value="14" aria-label="Tick pupil Flowers, Burns." aria-checked="false" role="checkbox">
                  <div></div>
              </div>
          </td>
      </tr>
  
      </tbody>
  </table>
`

describe('tableSort', function () {
  describe('getCellValue', function () {
    it('should return the text of the element', function () {
      const mockRow = {
        children: [
          {
            innerText: 'value'
          }
        ]
      }
      const result = window.MTCAdmin.tableSort.getCellValue(mockRow, 0)
      expect(result).toBe('value')
    })
  })
  describe('comparer', function () {
    it('should return 1 if second elements needs to be sorted first on ascending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('beta', 'alpha')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('alpha', 'beta')
      expect(result).toBe(1)
    })
    it('should return -1 if first elements needs to be sorted first on ascending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('alpha', 'beta')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('alpha', 'beta')
      expect(result).toBe(-1)
    })
    it('should return -1 if second elements needs to be sorted first on descending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('beta', 'alpha')
      const result = window.MTCAdmin.tableSort.comparer(0, false, {})('alpha', 'beta')
      expect(result).toBe(-1)
    })
    it('should return 1 if first elements needs to be sorted first on descending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('alpha', 'beta')
      const result = window.MTCAdmin.tableSort.comparer(0, false, {})('alpha', 'beta')
      expect(result).toBe(1)
    })
    it('should return 0 if elements are equal', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('alpha', 'alpha')
      const result = window.MTCAdmin.tableSort.comparer(0, false, {})('alpha', 'alpha')
      expect(result).toBe(0)
    })
    it('should return 1 if the second stringified number element needs to be sorted first on ascending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('2', '1')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('1', '2')
      expect(result).toBe(1)
    })
    it('should call return 0 if the elements are equal stringified numbers', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('1', '1')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('1', '1')
      expect(result).toBe(0)
    })
    it('should call getNumberComparisonResult if the values are stringified numbers', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('1', '1')
      spyOn(window.MTCAdmin.tableSort, 'getNumberComparisonResult').and.returnValue(0)
      spyOn(window.MTCAdmin.tableSort, 'getStringComparisonResult')
      window.MTCAdmin.tableSort.comparer(0, true, {})('1', '1')
      expect(window.MTCAdmin.tableSort.getStringComparisonResult).not.toHaveBeenCalled()
      expect(window.MTCAdmin.tableSort.getNumberComparisonResult).toHaveBeenCalled()
    })
    it('should call getStringComparisonResult if the values include combinations of letters and numbers', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('1a', '1')
      spyOn(window.MTCAdmin.tableSort, 'getNumberComparisonResult').and.returnValue(0)
      spyOn(window.MTCAdmin.tableSort, 'getStringComparisonResult')
      window.MTCAdmin.tableSort.comparer(0, true, {})('1', '1')
      expect(window.MTCAdmin.tableSort.getStringComparisonResult).toHaveBeenCalled()
      expect(window.MTCAdmin.tableSort.getNumberComparisonResult).not.toHaveBeenCalled()
    })
  })
  describe('isNullString', function () {
    it('should return false if config is not set', function () {
      const result = window.MTCAdmin.tableSort.isNullString('value', {})
      expect(result).toBeFalsy()
    })
    it('should return true if element is empty string', function () {
      const result = window.MTCAdmin.tableSort.isNullString('-', { sortNullsLast: true, ignoredStrings: ['-'] })
      expect(result).toBeTruthy()
    })
    it('should return true if element is empty string', function () {
      const result = window.MTCAdmin.tableSort.isNullString('', { sortNullsLast: true })
      expect(result).toBeTruthy()
    })
    it('should return true if element is ignored string', function () {
      const result = window.MTCAdmin.tableSort.isNullString('-', { sortNullsLast: true, ignoredStrings: ['-'] })
      expect(result).toBeTruthy()
    })
    it('should return false if configured to sort null values last but no ignored string is provided', function () {
      const result = window.MTCAdmin.tableSort.isNullString('test', { sortNullsLast: true, ignoredStrings: [] })
      expect(result).toBeFalsy()
    })
    it('should return false if configured to sort null values last but no ignored string detected in values', function () {
      const result = window.MTCAdmin.tableSort.isNullString('test', { sortNullsLast: true, ignoredStrings: ['N/A'] })
      expect(result).toBeFalsy()
    })
  })
  describe('applySortClass', function () {
    it('should add descending sorting class if order is undefined', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([{ className: '' }])
      const header = {
        getElementsByTagName: function () {}
      }
      const headerSpan = { className: '' }
      spyOn(header, 'getElementsByTagName').and.returnValue([headerSpan])
      window.MTCAdmin.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon desc')
    })
    it('should add ascending sorting class if order was descending', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([{ className: '' }])
      const header = {
        getElementsByTagName: function () {},
        asc: false
      }
      const headerSpan = { className: '' }
      spyOn(header, 'getElementsByTagName').and.returnValue([headerSpan])
      window.MTCAdmin.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon asc')
    })
    it('should add descending sorting class if order was ascending', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([{ className: '' }])
      const header = {
        getElementsByTagName: function () {},
        asc: true
      }
      const headerSpan = { className: '' }
      spyOn(header, 'getElementsByTagName').and.returnValue([headerSpan])
      window.MTCAdmin.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon desc')
    })
  })
  describe('setup', function () {
    it('should call querySelectorAll to fetch all th elements', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([])
      window.MTCAdmin.tableSort.setup(window.document, 'tableId', {}, undefined)
      expect(document.querySelectorAll).toHaveBeenCalled()
    })
    it('should attach event listeners for all th elements', function () {
      const tableHeaders = [
        { addEventListener: function () {} }
      ]
      spyOn(document, 'querySelectorAll').and.returnValue(tableHeaders)
      spyOn(tableHeaders[0], 'addEventListener')
      window.MTCAdmin.tableSort.setup(window.document, 'tableId', {}, undefined)
      expect(tableHeaders[0].addEventListener).toHaveBeenCalled()
    })
  })
  describe('applySorting', function () {
    let th
    beforeEach(() => {
      spyOn(window.MTCAdmin.tableSort, 'applySortClass')
      spyOn(window.MTCAdmin.tableSort, 'comparer')
      document.body.innerHTML = tableEls
      th = document.querySelectorAll('th')[0]
    })
    it('should call comparer method', function () {
      window.MTCAdmin.tableSort.applySorting(th, 0, 'generatePins', {}, undefined)
      expect(window.MTCAdmin.tableSort.comparer).toHaveBeenCalled()
    })
    it('should not call setAttribute to update the rowId based on the new base table row sequence when mirrorTableId is not supplied', function () {
      const tbody = document.querySelector('#generatePins tbody')
      const trNodeList = tbody.querySelectorAll('tr')
      const trList = [].slice.call(trNodeList)
      trList.forEach(function (tr, index) {
        spyOn(tr, 'setAttribute')
      })
      window.MTCAdmin.tableSort.applySorting(th, 0, 'generatePins', {}, undefined)
      trList.forEach(function (tr, index) {
        expect(tr.setAttribute).not.toHaveBeenCalled()
      })
    })
    it('should call setAttribute to update the rowId based on the new base table row sequence when mirrorTableId is supplied', function () {
      const tbody = document.querySelector('#generatePins tbody')
      const trNodeList = tbody.querySelectorAll('tr')
      const trList = [].slice.call(trNodeList)
      trList.forEach(function (tr, index) {
        spyOn(tr, 'setAttribute')
      })
      window.MTCAdmin.tableSort.applySorting(th, 0, 'generatePins', {}, 'pinSlips')
      trList.forEach(function (tr, index) {
        expect(tr.setAttribute).toHaveBeenCalled()
      })
    })
  })
  describe('isNumericValue', function () {
    it('returns true if the value is a stringified number', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue('1')
      expect(result).toBeTruthy()
    })
    it('returns true if the value is a number', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue(1)
      expect(result).toBeTruthy()
    })
    it('returns false if the value is a stringified combination of letters and numbers', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue('1a')
      expect(result).toBeFalsy()
    })
    it('returns false if the value is an empty string', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue('')
      expect(result).toBeFalsy()
    })
  })
  describe('getNumberComparisonResult', function () {
    it('returns negative number when the second value is greaer than the first in ascending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(1, 2, true)
      expect(result).toBe(-1)
    })
    it('returns positive number when the second value is greaer than the first in descending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(1, 2, false)
      expect(result).toBe(1)
    })
    it('returns negative number when the first value is greater than the second in ascending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(2, 1, true)
      expect(result).toBe(1)
    })
    it('returns positive number when the first value is greater than the second in descending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(2, 1, false)
      expect(result).toBe(-1)
    })
    it('returns 0 if they values are equal regardless of sorting type', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(1, 1, true)
      expect(result).toBe(0)
    })
  })
})
