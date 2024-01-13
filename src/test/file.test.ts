import * as assert from "assert";
import * as file from "../file";

suite("fileCommand # formatGitHubFileUrl", () => {
  test("should format strings for quick pick view", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10 }
    );
    assert.equal(
      results,
      "https://remote.url/blob/master/rel/path/to/file.js#L10"
    );
  });

  test("should format strings for quick pick view with remote mapping", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "master",
      "rel/path/to/file.js",
      { "https://remote.url": "https://mapped.remote.url" },
      { start: 10 }
    );
    assert.equal(
      results,
      "https://mapped.remote.url/blob/master/rel/path/to/file.js#L10"
    );
  });

  test("should format strings for quick pick view", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10, end: 20 }
    );
    assert.equal(
      results,
      "https://remote.url/blob/master/rel/path/to/file.js#L10-L20"
    );
  });

  test("should format strings for quick pick view", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10, end: 10 }
    );
    assert.equal(
      results,
      "https://remote.url/blob/master/rel/path/to/file.js#L10"
    );
  });

  test("should format strings for quick pick view", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "master",
      "rel/path/to/file.js"
    );
    assert.equal(results, "https://remote.url/blob/master/rel/path/to/file.js");
  });

  test("should format strings for quick pick view", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "feature/#foo",
      "rel/path/to/file.js"
    );
    assert.equal(
      results,
      "https://remote.url/blob/feature/%23foo/rel/path/to/file.js"
    );
  });

  test("should add ?plain=1 for markdown links", () => {
    const results = file.formatGitHubFileUrl(
      "https://remote.url",
      "master",
      "rel/path/to/file.md",
      {},
      { start: 10 }
    );
    assert.equal(
      results,
      "https://remote.url/blob/master/rel/path/to/file.md?plain=1#L10"
    );
  });
});

suite("fileCommand # formatBitbucketFileUrl", () => {
  test("should format strings for quick pick view", () => {
    const results = file.formatBitbucketFileUrl(
      "https://bitbucket.org/some/repo",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10 }
    );
    assert.equal(
      results,
      "https://bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10"
    );
  });
  test("should format strings for quick pick view with remote mapping", () => {
    const results = file.formatBitbucketFileUrl(
      "https://bitbucket.org/some/repo",
      "master",
      "rel/path/to/file.js",
      {
        "https://bitbucket.org/some/repo":
          "https://mapped.bitbucket.org/some/repo",
      },
      { start: 10 }
    );
    assert.equal(
      results,
      "https://mapped.bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatBitbucketFileUrl(
      "https://bitbucket.org/some/repo",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10, end: 20 }
    );
    assert.equal(
      results,
      "https://bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10:20"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatBitbucketFileUrl(
      "https://bitbucket.org/some/repo",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10, end: 10 }
    );
    assert.equal(
      results,
      "https://bitbucket.org/some/repo/src/master/rel/path/to/file.js#file.js-10"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatBitbucketFileUrl(
      "https://bitbucket.org/some/repo",
      "master",
      "rel/path/to/file.js"
    );
    assert.equal(
      results,
      "https://bitbucket.org/some/repo/src/master/rel/path/to/file.js"
    );
  });
});

suite("fileCommand # formatGitlabFileUrl", () => {
  test("should format strings for quick pick view", () => {
    const results = file.formatGitlabFileUrl(
      "https://gitlab.com/test/repo",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10 }
    );
    assert.equal(
      results,
      "https://gitlab.com/test/repo/blob/master/rel/path/to/file.js#L10"
    );
  });
  test("should format strings for quick pick view with remote mapping", () => {
    const results = file.formatGitlabFileUrl(
      "https://gitlab.com/test/repo",
      "master",
      "rel/path/to/file.js",
      { "https://gitlab.com/test/repo": "https://mapped.gitlab.com/test/repo" },
      { start: 10 }
    );
    assert.equal(
      results,
      "https://mapped.gitlab.com/test/repo/blob/master/rel/path/to/file.js#L10"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatGitlabFileUrl(
      "https://gitlab.com/test/repo",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10, end: 20 }
    );
    assert.equal(
      results,
      "https://gitlab.com/test/repo/blob/master/rel/path/to/file.js#L10-20"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatGitlabFileUrl(
      "https://gitlab.com/test/repo",
      "master",
      "rel/path/to/file.js",
      {},
      { start: 10, end: 10 }
    );
    assert.equal(
      results,
      "https://gitlab.com/test/repo/blob/master/rel/path/to/file.js#L10"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatGitlabFileUrl(
      "https://gitlab.com/test/repo",
      "master",
      "rel/path/to/file.js"
    );
    assert.equal(
      results,
      "https://gitlab.com/test/repo/blob/master/rel/path/to/file.js"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = file.formatGitlabFileUrl(
      "https://gitlab.com/test/repo",
      "feature/#foo",
      "rel/path/to/file.js"
    );
    assert.equal(
      results,
      "https://gitlab.com/test/repo/blob/feature/%23foo/rel/path/to/file.js"
    );
  });
});
