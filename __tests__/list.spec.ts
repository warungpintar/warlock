import * as list from '../src/utils/list';
import should from 'should';

const cases = [
  {
    input: [
      {
        foo: 'bar',
        bar: 'test-1',
      },
      {
        foo: 'bar',
        bar: 'test-2',
      },
      {
        foo: 'baz',
        bar: 'test-3',
      },
    ],
    expected: {
      bar: [
        {
          foo: 'bar',
          bar: 'test-1',
        },
        {
          foo: 'bar',
          bar: 'test-2',
        },
      ],
      baz: [
        {
          foo: 'baz',
          bar: 'test-3',
        },
      ],
    },
  },
];

describe('List Utils', () => {
  describe('should return grouped as expected', () => {
    cases.forEach((item, i) => {
      it(`test case ${i + 1}`, () => {
        should(list.groupListBy('foo', item.input)).be.deepEqual(item.expected);
      });
    });
  });
});
