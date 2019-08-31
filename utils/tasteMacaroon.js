const macaroon = require('macaroon');

module.exports = (req, res, next) => {
  try {
    var mac = req.headers.macaroon;
    var base64macaroon = macaroon.base64ToBytes(mac);
    var veraccessmcrn = macaroon.importMacaroon (base64macaroon);
    veraccessmcrn.verify(verRootkey, () => null, []);
    next();
  } catch (error) {
    res.status(401).json({
      message: "Authentication Failed!",
      error: "Bad Macaroon!"
    });
  }
};