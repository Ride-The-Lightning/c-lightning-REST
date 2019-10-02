const macaroon = require('macaroon');

module.exports = (req, res, next) => {
  try {
    // mac is in hex format
    var mac = req.headers.macaroon;
    var base64Macaroon = Buffer.from(mac, 'hex').toString('base64');
    var bytesMacaroon = macaroon.base64ToBytes(base64Macaroon);
    var veraccessmcrn = macaroon.importMacaroon(bytesMacaroon);
    veraccessmcrn.verify(verRootkey, () => null, []);
    next();
  } catch (error) {
    res.status(401).json({
      message: "Authentication Failed!",
      error: "Bad Macaroon!"
    });
  }
};
