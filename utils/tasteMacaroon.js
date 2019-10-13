const macaroon = require('macaroon');

module.exports = (req, res, next) => {
  try {
    // mac is in hex format
    var mac = req.headers.macaroon;
    var encType = req.headers.encodingtype ? req.headers.encodingtype : 'base64';
    if(encType === 'hex') { 
      var base64Macaroon = Buffer.from(mac, 'hex').toString('base64');
      var bytesMacaroon = macaroon.base64ToBytes(base64Macaroon);
      var veraccessmcrn = macaroon.importMacaroon(bytesMacaroon);
    }
    else {
      var base64macaroon = macaroon.base64ToBytes(mac);
      var veraccessmcrn = macaroon.importMacaroon (base64macaroon);
    }
    veraccessmcrn.verify(verRootkey, () => null, []);
    next();
  } catch (error) {
    res.status(401).json({
      message: "Authentication Failed!",
      error: "Bad Macaroon!"
    });
  }
};
