import * as assert from 'assert';
import * as file from '../src/file';

suite('fileCommand # formatGitHubFileUrl', () => {
  test('should format strings for quick pick view', () => {
    const results = file.formatGitHubFileUrl('https://remote.url', 'master', 'rel/path/to/file.js', { start: 10 });
    assert.equal(results, 'https://remote.url/blob/master/rel/path/to/file.js#L10');
  });
  test('should format strings for quick pick view', () => {
    const results = file.formatGitHubFileUrl('https://remote.url', 'master', 'rel/path/to/file.js', { start: 10, end: 20 });
    assert.equal(results, 'https://remote.url/blob/master/rel/path/to/file.js#L10:L20');
  });
  test('should format strings for quick pick view', () => {
    const results = file.formatGitHubFileUrl('https://remote.url', 'master', 'rel/path/to/file.js', { start: 10, end: 10 });
    assert.equal(results, 'https://remote.url/blob/master/rel/path/to/file.js#L10');
  });
  test('should format strings for quick pick view', () => {
    const results = file.formatGitHubFileUrl('https://remote.url', 'master', 'rel/path/to/file.js');
    assert.equal(results, 'https://remote.url/blob/master/rel/path/to/file.js');
  });
});

suite('fileCommand # formatBitbucketFileUrl', () => {
  test('should format strings for quick pick view', () => {
    const results = file.formatBitbucketFileUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js', { start: 10 });
    assert.equal(results, 'https://bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10');
  });
  test('should format strings for quick pick view', () => {
    const results = file.formatBitbucketFileUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js', { start: 10, end: 20 });
    assert.equal(results, 'https://bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10:20');
  });
    test('should format strings for quick pick view', () => {
    const results = file.formatBitbucketFileUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js', { start: 10, end: 10 });
    assert.equal(results, 'https://bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10');
  });
  test('should format strings for quick pick view', () => {
    const results = file.formatBitbucketFileUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js');
    assert.equal(results, 'https://bitbucket.org/some/repo/src/master/rel/path/to/file.js');
  });
});
