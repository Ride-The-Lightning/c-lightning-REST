const isVersionCompatible = (currentVersion, checkVersion) => {
    if (currentVersion) {
      let pattern = /v?(\d+(\.\d+)*)/; 
      let match = currentVersion.match(pattern);
      if (match && match.length && match.length > 1) {
        logger.log('Global Version: ' + match[1]);
        logger.log('Checking Compatiblility with Version: ' + checkVersion);
        const currentVersionArr = match[1].split('.') || [];
        currentVersionArr[1] = currentVersionArr[1].substring(0, 2);
        const checkVersionsArr = checkVersion.split('.');
        checkVersionsArr[1] = checkVersionsArr[1].substring(0, 2);
        return (+currentVersionArr[0] > +checkVersionsArr[0]) ||
        (+currentVersionArr[0] === +checkVersionsArr[0] && +currentVersionArr[1] > +checkVersionsArr[1]) ||
        (+currentVersionArr[0] === +checkVersionsArr[0] && +currentVersionArr[1] === +checkVersionsArr[1] && +currentVersionArr[2] >= +checkVersionsArr[2]);
      } else {
        logger.warn('Invalid Version String: ' + currentVersion);
        return false;
      }
    }
    return false;
};

module.exports = { isVersionCompatible };
