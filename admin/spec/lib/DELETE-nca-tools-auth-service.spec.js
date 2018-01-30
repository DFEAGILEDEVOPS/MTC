'use strict'
/* global describe, it, expect */

const crypto = require('crypto')
const iconv = require('iconv-lite')
const proxyquire = require('proxyquire')
const NcaToolsAuthTokenMock = function () {
  this.save = function () {
    return new Promise(function (resolve) {
      resolve({_id: 111})
    })
  }
}
const ncaToolsAuthService = proxyquire('../../lib/DELETE-nca-tools-auth-service', {'../models/nca-tools-auth-token': NcaToolsAuthTokenMock})

const recipientFakePrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAv6UHh2iibgIBb9QSi7l7nSlx2bsyzYkRTHgleZ9bJrxwPAe7
7b1/gAOLAetEheTUkx1pMLwZJmL1MV0c/QA2L06zv/JJ0kDI9McC000zqBp8U0/H
t0qIlZsGLPVp6Ngm4ANV6PNxoALpObif49+vs+B/Rzw+xfKtYIhx9j8pQevKaRKd
aLE28A2LUOazhbqhBUg71S5nKPzcO/QDX7xsLxROelHCtGPYpM2pKoluGNm34Tr4
dbApg56eWVJaas+lQEoCrdpIgxYI2byh66vPbMXtSPafHIVO6NJ4mcCMkfeH8g3t
yjijncCSmeFt/gFHaiqfvmmpdmYGBWJZSZdgewIDAQABAoIBABOK5aCmR+IF7FWV
/6ol6PgW0NhOIZkaAByXJ+MmH+psTtmgREazCzxnoBY7AorQ0eiKmD5y//GNJ8m3
4AvgqKXcVbIeJ+770kI7xQr9FWZwBPuN6CTFwfXXkCKnh/xJhnVTgcA2iwCxK01K
iWt4VPd3ziLafuA6pflxEIX23OMu1g7IIG3oOL+l+r1F8IVTY71iUB+nZ7Ft4QgJ
D25nZ7EMqHuSs4PH6GpSKwevkcyZ4hp3Ab2zNW+5tdXPiEiMdss0IeB6m3YfNLSG
O1ekTDz+z5Y1LWveaiebZIWZFRaS6mby+stvkR9Gs9/WFJCm7ZmnWqAj45ZHY0Ox
VLqLS3kCgYEA4nIKfUVXhI7cBkD6CyhJDz/BdJ4SZE28lJdSKRpB5wf7H4/sUqU5
Uce1fpfTcs/0b850ipWNKA1ZfWjGIGDECVwXJHdZBdTfeh0aVRqPqt9dPXpaokxN
QVbnlre3q6gegpkAetch7YNFsVzIbVQM2Yc1ihDNFv3Id7Is49FgGfcCgYEA2Kg6
mt6ke8xibAAT97mmZB6MRlrKXhHajzPHX/EsS5l3lmjz5Rq36ER12YXa93xkKa7o
IXdLc6e3uB0y2thpBkfCXBoQLtkqxBHArpQ3iUlMeJtw++RpnsmrmH0c9ogDgNoh
L76iPUDoZC/Ooo5RMnOQmNHKjMugN3GQEzgXLJ0CgYBx9PwsYLoTXqWBjC+Jb+Oc
hfRAUNBmo+xURva08p7Zul15W7+NM9LtwfgnVha2P8r+fUKO/4YC8vznLNQQNUJS
h4Kp+lnVonQ4iu7Wh0BnuHK+3pU/+fAjAq4XXitTeo6oIIFqUFuloJtxD4VZ56Nz
0SRzb9MWT+8TtZn7qEGZrwKBgQDIPXukxV+qV7UjclMCIyCo6h7lq2Xb2Y5xyf5c
Kw+wc4+2gRvhxHbzAcsWFwPQtrPwXoqG27Xtl7ZSQRJOd7NhrZLyAtiwI+DFxE6c
S7qkdQ1rbubWuD3yFxw0XHYXWJA8V95SPVO/Xy0p45GMZhKfmXWr+EHHLS/P7nKl
gLLSdQKBgH0/W3xjSOM1Egtgh1MLru1xrNg3P+aKrGCd3ejgmtcLpYllXlizOpZ4
GSEJMQoMN6Dnbu84WQQr68fXNpnvn6JujMpw1t1zT/TmvVkH5KBteE3kN3cxJyd+
p7CtzHwBkqkZE1WdWyNFw8dtRLKB5tPWzYGbLhW9b3wlFdZDGkmF
-----END RSA PRIVATE KEY-----`

const recipientFakePublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv6UHh2iibgIBb9QSi7l7
nSlx2bsyzYkRTHgleZ9bJrxwPAe77b1/gAOLAetEheTUkx1pMLwZJmL1MV0c/QA2
L06zv/JJ0kDI9McC000zqBp8U0/Ht0qIlZsGLPVp6Ngm4ANV6PNxoALpObif49+v
s+B/Rzw+xfKtYIhx9j8pQevKaRKdaLE28A2LUOazhbqhBUg71S5nKPzcO/QDX7xs
LxROelHCtGPYpM2pKoluGNm34Tr4dbApg56eWVJaas+lQEoCrdpIgxYI2byh66vP
bMXtSPafHIVO6NJ4mcCMkfeH8g3tyjijncCSmeFt/gFHaiqfvmmpdmYGBWJZSZdg
ewIDAQAB
-----END PUBLIC KEY-----`

const senderFakePrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAvntLI3qp7PBekZH7XhTl5q0GnMJ6cFJePz9pVBD1J1H1Mmc/
Y/g0hR5F49VVbNKfm2qxuxECegCgFAFct8h80pEO3RmB4KwyNTBZ3S4gp6XA5rKr
KoKd636Jhkh2HsvxjUuTE+9o4OeclxhZJrq3ao6wRT7RP7OyIZc47nd7EKpKmQOb
Q3AdZ8n9z0ZjDJFghoMTSBqIN+fqs1sXlZrvTPjnrKlSMxtUCjAKHgpxBHurXtZ+
O4NviJDZgBW6LCT4E30lgUBPa52KMAZz/5oZKSqAIs+iBJ3UI9QnKNOeO8ORvkRm
tz+V7jHj/7xuCs/joD6/UtXKvEIw4vaVBKci1wIDAQABAoIBAHjkU2nvHg3M+Jg3
KGwro0XmJr4zB/ZlsH8/xZ+fK5iLAa29rZPLIboi3oSdDxyECNxguPBa+VFpOC+6
NZhG3EHf4qkc2Ts4zpzHVSF1dzAvmOBSISRXxdaCdtINBzrAgUwF3RDX755eIRoc
T+iutF4itWkdVzyw1atQCMgAeNC3yzDbYP32g2Zv62j9ElK8P1gfrnPRre9EOpqd
tzEkle3tYXQBst296JIurM1w2Yx4e+19a/X8ChBsALb1buCXOEQJtRss4mLQwM3/
EIgz7WRQCmn53sCg6lMoQ6+QDVYrq0sWs+ppq0ui4pmJLS+z1yV04uPCdIZgjfUk
MSNjA9ECgYEA5Cbm+7lm625u4DaZYWlRH9jlFSm+6tezWzHjCP2gVwd0n8f3tvkd
B9EpY/JtmqLoSCASDQ2AUVAqk/F1BgvyP7pkuQZ2huCqImnmu0hREnKJnAfIapec
kUFOANJrw5uRH9W2etgzL+5HNbeYmkoqe1jtWe/TXcIH8yjtkCIuznsCgYEA1btM
5uBqHI/hWe6LLyjH1CGKmgiLcEShj8vEVweT8Ib7k2D2i9r/FWh7zfdWI1gY5MpJ
b93ESkw0fDeyh1so7caTcyiDBNlE2N5i/VI1mriQhvv+iKpLuklHoxhUpUy+tvKT
BgvxkMqqM8zM6vmezeKgVaOToF1GcA/eRD57fFUCgYA7WUNMx/XV2GxPNuS/Sj4o
Iqu0zZ80R9gIKPn+JLvI58+WoNX3auX6WpaBwVZxm18BJBaN/q0aedgZk/31DLZ/
jWUWHHBItbiMKzAyF6W/Prw9MmkYEUhRIMPBwvr1b0pZFabaXdMy7LDpcFDqEdDr
NT7I3nIFOawHvOXPUJUMcQKBgQCxI/x3ufWYWJOQgsmuu2DrayVBxuUyll9FG8BN
1UUC7A0kOA//F/Gkn6VErsMgpgpzzUiSQ75FSeWSMmNwFdjVQWjB4Ai/Awgxqhdn
FzTAWEnI5qAuSt5athN+lFLLcdD7Ng8uysVamO354rrP4TWCNFtovxtCpSwVAsHX
0+VqxQKBgQDUSekp86iRmYO6HjSls3fygkHgOuU9GhDgl33kepMMM5FOqeK2Y17r
ohp6RGYwh53LInowhcm52qHUlcUx93xO4UbL1eOWwx+4AmCWbbxERQ+4LzQlnatC
AaV2C8hd1pMgSR6VAHxovWDq9LqlGWyPPKRSGt6C62YQUUQ1S9xq2g==
-----END RSA PRIVATE KEY-----`

const senderFakePublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvntLI3qp7PBekZH7XhTl
5q0GnMJ6cFJePz9pVBD1J1H1Mmc/Y/g0hR5F49VVbNKfm2qxuxECegCgFAFct8h8
0pEO3RmB4KwyNTBZ3S4gp6XA5rKrKoKd636Jhkh2HsvxjUuTE+9o4OeclxhZJrq3
ao6wRT7RP7OyIZc47nd7EKpKmQObQ3AdZ8n9z0ZjDJFghoMTSBqIN+fqs1sXlZrv
TPjnrKlSMxtUCjAKHgpxBHurXtZ+O4NviJDZgBW6LCT4E30lgUBPa52KMAZz/5oZ
KSqAIs+iBJ3UI9QnKNOeO8ORvkRmtz+V7jHj/7xuCs/joD6/UtXKvEIw4vaVBKci
1wIDAQAB
-----END PUBLIC KEY-----`

function getEncryptedVars (data) {
  const utf16Data = iconv.encode(data, 'utf16')
  const keyBuf = crypto.createHash('sha256').update('abcdefghijk').digest()
  const ivBuf = Buffer.from('MTCSTA0000000009')
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuf, ivBuf)
  const buf1 = cipher.update(utf16Data)
  const buf2 = cipher.final()
  const encBuf = Buffer.concat([buf1, buf2])

  // We need to encrypt the keyBuf and ivBuf with the public key of the recipient
  const encKeyBuf = crypto.publicEncrypt(recipientFakePublicKey, keyBuf)
  const encIvBuf = crypto.publicEncrypt(recipientFakePublicKey, ivBuf)

  // Create a signature: a signed hash of the encrypted data using the senders private keyBuf
  const sign = crypto.createSign('RSA-SHA1')
  sign.write(encBuf)
  sign.end()
  const signatureB64 = sign.sign(senderFakePrivateKey, 'base64')
  return {encBuf, encKeyBuf, encIvBuf, signatureB64}
}

const data = 'SessionToken=abc-1234;UserName=Test User;UserType=SuperUser;School=9991001;EmailAddress=example@example.com'
const {encBuf, encKeyBuf, encIvBuf, signatureB64} = getEncryptedVars(data)

describe('nca tools auth service', function () {
  it('authenticates a valid packet', async function (done) {
    try {
      const result = await ncaToolsAuthService(
        encKeyBuf.toString('base64'),
        encIvBuf.toString('base64'),
        encBuf.toString('base64'),
        signatureB64,
        senderFakePublicKey,
        recipientFakePrivateKey
      )
      expect(result).toBeDefined()
      expect(result.SessionToken).toBeDefined()
      expect(result.role).toBeDefined()
    } catch (error) {
      console.log(error)
      done(error)
    }
    done()
  })

  it('maps to teacher for an unknown role', async function (done) {
    try {
      const data = 'SessionToken=abcd-1234;UserName=Test User;UserType=Batman;School=9991001;EmailAddress=example@example.com'
      const {encBuf, encKeyBuf, encIvBuf, signatureB64} = getEncryptedVars(data)
      const result = await ncaToolsAuthService(
        encKeyBuf.toString('base64'),
        encIvBuf.toString('base64'),
        encBuf.toString('base64'),
        signatureB64,
        senderFakePublicKey,
        recipientFakePrivateKey
      )
      expect(result).toBeDefined()
      expect(result.role).toBeDefined()
      expect(result.role).toBe('TEACHER')
      expect(result.UserType).toBe('Batman')
    } catch (error) {
      console.log(error)
      done(error)
    }
    done()
  })

  it('rejects a promise if the key is missing', async function (done) {
    try {
      await ncaToolsAuthService(
        encIvBuf.toString('base64'),
        encBuf.toString('base64'),
        signatureB64,
        senderFakePublicKey,
        recipientFakePrivateKey
      )
      done('promise resolved instead of rejected')
    } catch (error) {
      expect(error.message).toBe('Missing parameters')
      done()
    }
  })

  it('rejects a promise if the key is null', async function (done) {
    try {
      await ncaToolsAuthService(
        null,
        encIvBuf.toString('base64'),
        encBuf.toString('base64'),
        signatureB64,
        senderFakePublicKey,
        recipientFakePrivateKey
      )
      done('promise resolved instead of rejected')
    } catch (error) {
      expect(error.message).toBe('Missing parameters')
      done()
    }
  })

  it('rejects a promise if the signature is invalid', async function (done) {
    try {
      await ncaToolsAuthService(
        encKeyBuf.toString('base64'),
        encIvBuf.toString('base64'),
        encBuf.toString('base64'),
        'an invalid signature',
        senderFakePublicKey,
        recipientFakePrivateKey
      )
      done('promise resolved instead of rejected')
    } catch (error) {
      expect(error.message).toBe('Signature failed verification')
      done()
    }
  })

  it('rejects a promise if the SessionToken is not provided', async function (done) {
    try {
      const data = 'UserName=Test User;UserType=SuperUser;School=9991001;EmailAddress=example@example.com'
      const {encBuf, encKeyBuf, encIvBuf, signatureB64} = getEncryptedVars(data)
      await ncaToolsAuthService(
        encKeyBuf.toString('base64'),
        encIvBuf.toString('base64'),
        encBuf.toString('base64'),
        signatureB64,
        senderFakePublicKey,
        recipientFakePrivateKey
      )
      done('promise resolved instead of rejected')
    } catch (error) {
      expect(error.message).toBe('No session token provided')
      done()
    }
  })

  it('should be deleted as its now in a service', () => {
    fail('delete service in lib and these tests')
  })
})
