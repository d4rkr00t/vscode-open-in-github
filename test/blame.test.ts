import * as assert from 'assert';
import * as blame from '../src/blame';
import { SelectedLines } from '../src/common';

suite('blameCommand # formatGitHubBlameUrl', () => {
  test('should format strings for quick pick view', () => {
    const results = blame.formatGitHubBlameUrl('https://remote.url', 'master', 'rel/path/to/file.js', { start: 10 });
    assert.equal(results, 'https://remote.url/blame/master/rel/path/to/file.js#L10');
  });

  test('should format strings for quick pick view', () => {
    const results = blame.formatGitHubBlameUrl('https://remote.url', 'master', 'rel/path/to/file.js', { start: 10, end: 20 });
    assert.equal(results, 'https://remote.url/blame/master/rel/path/to/file.js#L10-L20');
  });

  test('should format strings for quick pick view', () => {
    const results = blame.formatGitHubBlameUrl('https://remote.url', 'master', 'rel/path/to/file.js', { start: 10, end: 10 });
    assert.equal(results, 'https://remote.url/blame/master/rel/path/to/file.js#L10');
  });

  test('should format strings for quick pick view', () => {
    const results = blame.formatGitHubBlameUrl('https://remote.url', 'master', 'rel/path/to/file.js');
    assert.equal(results, 'https://remote.url/blame/master/rel/path/to/file.js');
  });
});

suite('blameCommand # formatBitbucketBlameUrl', () => {
  test('should format strings for quick pick view', () => {
    const results = blame.formatBitbucketBlameUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js', { start: 10 });
    assert.equal(results, 'https://bitbucket.org/some/repo/annotate/master/rel/path/to/file.js#file.js-10');
  });

  test('should format strings for quick pick view', () => {
    const results = blame.formatBitbucketBlameUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js', { start: 10, end: 20 });
    assert.equal(results, 'https://bitbucket.org/some/repo/annotate/master/rel/path/to/file.js#file.js-10:20');
  });

  test('should format strings for quick pick view', () => {
    const results = blame.formatBitbucketBlameUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js', { start: 10, end: 10 });
    assert.equal(results, 'https://bitbucket.org/some/repo/annotate/master/rel/path/to/file.js#file.js-10');
  });

  test('should format strings for quick pick view', () => {
    const results = blame.formatBitbucketBlameUrl('https://bitbucket.org/some/repo', 'master', 'rel/path/to/file.js');
    assert.equal(results, 'https://bitbucket.org/some/repo/annotate/master/rel/path/to/file.js');
  });
});
