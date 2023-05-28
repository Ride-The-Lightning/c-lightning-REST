const isVersionCompatible = (currentVersion, checkVersion) => {
    if (currentVersion) {
      const currentVersionArr = currentVersion.trim()?.replace('v', '').split('-')[0].split('.') || [];
      currentVersionArr[1] = currentVersionArr[1].substring(0, 2);
      const checkVersionsArr = checkVersion.split('.');
      checkVersionsArr[1] = checkVersionsArr[1].substring(0, 2);
      return (+currentVersionArr[0] > +checkVersionsArr[0]) ||
        (+currentVersionArr[0] === +checkVersionsArr[0] && +currentVersionArr[1] > +checkVersionsArr[1]) ||
        (+currentVersionArr[0] === +checkVersionsArr[0] && +currentVersionArr[1] === +checkVersionsArr[1] && +currentVersionArr[2] >= +checkVersionsArr[2]);
    }
    return false;
};

module.exports = { isVersionCompatible };
