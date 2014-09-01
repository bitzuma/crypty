/**
 * (c) 2014 Richard L. Apodaca
 * Licensed under MIT License.
 */

describe('Curve', function () {
  var params, curve;
  beforeEach(function () {
    params = Curve.Params.secp256k1;
    curve = new Curve(params);
  });
  describe('#double', function () {
    var vectors;
    beforeEach(function () {
      // from: https://github.com/conformal/btcec/blob/master/btcec_test.go
      vectors = [
        [
          '0',
          '0',
          '0',
          '0'
        ],
        [
          'e41387ffd8baaeeb43c2faa44e141b19790e8ac1f7ff43d480dc132230536f86',
          '1b88191d430f559896149c86cbcb703193105e3cf3213c0c3556399836a2b899',
          '88da47a089d333371bd798c548ef7caae76e737c1980b452d367b3cfe3082c19',
          '3b6f659b09a362821dfcfefdbfbc2e59b935ba081b6c249eb147b3c2100b1bc1'
        ],
        [
          'b3589b5d984f03ef7c80aeae444f919374799edf18d375cab10489a3009cff0c',
          'c26cf343875b3630e15bccc61202815b5d8f1fd11308934a584a5babe69db36a',
          'e193860172998751e527bb12563855602a227fc1f612523394da53b746bb2fb1',
          '2bfcf13d2f5ab8bb5c611fab5ebbed3dc2f057062b39a335224c22f090c04789'
        ],
        [
          '2b31a40fbebe3440d43ac28dba23eee71c62762c3fe3dbd88b4ab82dc6a82340',
          '9ba7deb02f5c010e217607fd49d58db78ec273371ea828b49891ce2fd74959a1',
          '2c8d5ef0d343b1a1a48aa336078eadda8481cb048d9305dc4fdf7ee5f65973a2',
          'bb4914ac729e26d3cd8f8dc8f702f3f4bb7e0e9c5ae43335f6e94c2de6c3dc95'
        ],
        [
          '61c64b760b51981fab54716d5078ab7dffc93730b1d1823477e27c51f6904c7a',
          'ef6eb16ea1a36af69d7f66524c75a3a5e84c13be8fbc2e811e0563c5405e49bd',
          '5f0dcdd2595f5ad83318a0f9da481039e36f135005420393e72dfca985b482f4',
          'a01c849b0837065c1cb481b0932c441f49d1cab1b4b9f355c35173d93f110ae0'
        ]
      ];
    });
    it('passes test vectors', function () {
      for (var i = 0; i < vectors.length; i++) {
        var vector = vectors[i];
        var p1 = new Point(vector[0], vector[1]);
        var p2 = new Point(vector[2], vector[3]);
        var double = curve.double(p1);
        
        expect(double.equals(p2)).toEqual(true);
      }
    });
  });
  describe('#add', function () {
    var vectors;
    beforeEach(function () {
      // from: https://github.com/conformal/btcec/blob/master/btcec_test.go
      vectors = [
        [
          '34f9460f0e4f08393d192b3c5133a6ba099aa0ad9fd54ebccfacdfa239ff49c6',
          '0b71ea9bd730fd8923f6d25a7a91e7dd7728a960686cb5a901bb419e0f2ca232',
          'd74bf844b0862475103d96a611cf2d898447e288d34b360bc885cb8ce7c00575',
          '131c670d414c4546b88ac3ff664611b1c38ceb1c21d76369d7a7a0969d61d97d',
          'fd5b88c21d3143518d522cd2796f3d726793c88b3e05636bc829448e053fed69',
          '21cf4f6a5be5ff6380234c50424a970b1f7e718f5eb58f68198c108d642a137f'    
        ],
        [
          '34f9460f0e4f08393d192b3c5133a6ba099aa0ad9fd54ebccfacdfa239ff49c6',
          '0b71ea9bd730fd8923f6d25a7a91e7dd7728a960686cb5a901bb419e0f2ca232',
          'd74bf844b0862475103d96a611cf2d898447e288d34b360bc885cb8ce7c00575',
          '131c670d414c4546b88ac3ff664611b1c38ceb1c21d76369d7a7a0969d61d97d',
          'fd5b88c21d3143518d522cd2796f3d726793c88b3e05636bc829448e053fed69',
          '21cf4f6a5be5ff6380234c50424a970b1f7e718f5eb58f68198c108d642a137f'
        ]
      ];
    });
    it('passes test vectors', function () {
      for (var i = 0; i < vectors.length; i++) {
        var vector = vectors[i];
        var p1 = new Point(vector[0], vector[1]);
        var p2 = new Point(vector[2], vector[3]);
        var p3 = new Point(vector[4], vector[5]);
        var sum = curve.add(p1, p2);
        
        expect(sum.equals(p3)).toEqual(true);
      }
    });
  });
  describe('#multiply', function () {
    var vectors;
    beforeEach(function () {
      // from: https://github.com/conformal/btcec/blob/master/btcec_test.go
      vectors = [
        [
          'AA5E28D6A97A2479A65527F7290311A3624D4CC0FA1578598EE3C2613BF99522',
          '34F9460F0E4F08393D192B3C5133A6BA099AA0AD9FD54EBCCFACDFA239FF49C6',
          'B71EA9BD730FD8923F6D25A7A91E7DD7728A960686CB5A901BB419E0F2CA232'
        ],
        [
          '7E2B897B8CEBC6361663AD410835639826D590F393D90A9538881735256DFAE3',
          'D74BF844B0862475103D96A611CF2D898447E288D34B360BC885CB8CE7C00575',
          '131C670D414C4546B88AC3FF664611B1C38CEB1C21D76369D7A7A0969D61D97D'
        ],
        [
          '6461E6DF0FE7DFD05329F41BF771B86578143D4DD1F7866FB4CA7E97C5FA945D',
          'E8AECC370AEDD953483719A116711963CE201AC3EB21D3F3257BB48668C6A72F',
          'C25CAF2F0EBA1DDB2F0F3F47866299EF907867B7D27E95B3873BF98397B24EE1'
        ],
        [
          '376A3A2CDCD12581EFFF13EE4AD44C4044B8A0524C42422A7E1E181E4DEECCEC',
          '14890E61FCD4B0BD92E5B36C81372CA6FED471EF3AA60A3E415EE4FE987DABA1',
          '297B858D9F752AB42D3BCA67EE0EB6DCD1C2B7B0DBE23397E66ADC272263F982'
        ],
        [
          '1B22644A7BE026548810C378D0B2994EEFA6D2B9881803CB02CEFF865287D1B9',
          'F73C65EAD01C5126F28F442D087689BFA08E12763E0CEC1D35B01751FD735ED3',
          'F449A8376906482A84ED01479BD18882B919C140D638307F0C0934BA12590BDE'
        ]
      ];
    });
    it('passes test vectors', function () {
      for (var i = 0; i < vectors.length; i++) {
        var vector = vectors[i];
        var scalar = new BigInt(vector[0], 16);
        var product = curve.multiply(scalar, params.G);
        var expected = new Point(vector[1], vector[2]);
        
        expect(product.equals(expected)).toEqual(true);
      }
    });
  });
});
