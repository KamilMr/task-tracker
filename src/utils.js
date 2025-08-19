const toSnakeCase = str => {
  return str
    .replace(/\s+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase();
};

const toCamelCase = str => {
  return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const convToSnake = obj => {
  return Object.keys(obj).reduce((pv, cv) => {
    pv[toSnakeCase(cv)] = obj[cv];
    return pv;
  }, {});
};

export const mapObjToSnake = (obj, keys) => {
  return keys.reduce((pv, cv) => {
    if (!obj[cv]) return pv;

    pv[cv] = obj[cv];
    return pv;
  }, {});
};

export const mapToCamel = obj => {
  return Object.keys(obj).reduce((pv, cv) => {
    pv[toCamelCase(cv)] = obj[cv];
    return pv;
  }, {});
};

export const getFormatedDate = (now = new Date()) => {
  const date = now.toISOString().split('T')[0]; // format YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0]; // format HH:mm
  return `${date} ${time}`;
};

export const formatNumbToHHMMss = time => {
  const hours = parseInt(time / (60 * 60), 10);
  const minutes = parseInt((time % (60 * 60)) / 60, 10);
  const seconds = time % 60;

  return `${hours} h ${minutes} min ${seconds} sec`;
};

export const clearTerminal = () => {
  process.stdout.write('\x1Bc'); // This escape character clears the terminal
};

export const convToTss = (date = new Date()) => {
  return Math.floor(new Date(date).getTime() / 1000);
};

