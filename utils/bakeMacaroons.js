const macaroon = require('macaroon');
const crypto = require('crypto');

exports.bakeMcrns = () => {
    try {
    var location = "localhost";
    var rootKey = crypto.randomBytes(64).toString('hex');
    var identifier = new Date().toString();

    //Generate Macaroon
    var accessMacaroon = macaroon.newMacaroon({identifier:identifier, location:location, rootKey:rootKey});

    return [rootKey, accessMacaroon.exportBinary()];
    } catch (error) {
        throw new Error(error);
    }
}