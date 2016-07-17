import * as assert from 'assert';
import * as common from '../src/common';
import * as blame from '../src/history';

suite('historyCommand # formatQuickPickItems', () => {
  test('should format strings for quick pick view', () => {
    const results = blame.formatQuickPickItems('rel/path/to/file.js', 10, ['https://remote.url'], 'master');
    assert.equal(results[0], '[master]\t—\thttps://remote.url/commits/master/rel/path/to/file.js');
  });
});
