import * as assert from 'assert';
import * as common from '../src/common';
import * as file from '../src/file';

suite('#formatQuickPickItems', () => {
  test('should format strings for quick pick view', () => {
    const results = file.formatQuickPickItems('rel/path/to/file.js', 10, ['https://remote.url'], 'master');
    assert.equal(results[0], '[master]\t—\thttps://remote.url/blob/master/rel/path/to/file.js#L10');
  });
});
