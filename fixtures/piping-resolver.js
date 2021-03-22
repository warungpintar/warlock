const { addYears, formatWithOptions } = require('date-fns/fp');
const locale = require('date-fns/locale');
const { of, map, head } = require('fp-ts/Array');
const { fold } = require('fp-ts/Option');
const { pipe } = require('fp-ts/function');

const resolver = (parent) => {
  const addFiveYears = addYears(5);
  const dateToString = formatWithOptions({ locale: locale.id }, 'd MMMM yyyy');
  const dates = new Date(2021, 2, 10);
  const formattedDates = pipe(
    of(dates),
    map(addFiveYears),
    map(dateToString),
    head,
  );

  return fold(
    () => parent,
    (a) => a,
  )(formattedDates);
};

module.exports = resolver;
