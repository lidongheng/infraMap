const isDef = (value) => {
  return value !== undefined && value !== null;
};

export const cloneDeep = (obj) => {
  if (!isDef(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cloneDeep(item));
  }

  if (typeof obj === 'object') {
    const to = {};
    Object.keys(obj).forEach(key => {
      to[key] = cloneDeep(obj[key]);
    });
    return to;
  }

  return obj;
};