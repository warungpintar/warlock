import { pathTransform } from '../src/utils/pathTransform';

describe('path transform', () => {
  const data = {
    people: [
      { name: 'ade', hobbies: ['lol', 'lil'] },
      { name: 'rin', hobbies: ['lol', 'lil'] },
    ],
    lols: {
      lol: {
        name: 'rudi',
        age: 20,
      },
    },
  };

  it('should match expectation', () => {
    const expectation = {
      people: [
        { name: null, hobbies: [null, 'lil'] },
        { name: null, hobbies: ['lol', 'lil'] },
      ],
      lols: {
        lol: {
          name: 'mantap',
          age: 20,
        },
      },
    };

    expect(
      pathTransform(data, {
        modifier: {
          'root.people.[].name': () => null,
          'root.people.[0].hobbies.[0]': () => null,
          'root.lols.lol.name': () => 'mantap',
        },
      }),
    ).toStrictEqual(expectation);
  });
});
