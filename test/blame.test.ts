import * as assert from 'assert';
import * as common from '../src/common';
import * as blame from '../src/blame';

suite('blameCommand # formatQuickPickItems', () => {
  test('should format strings for quick pick view', () => {
    const results = blame.formatQuickPickItems('rel/path/to/file.js', 10, ['https://remote.url'], 'master');
    assert.equal(results[0], '[master]\t—\thttps://remote.url/blame/master/rel/path/to/file.js#L10');
  });
});
