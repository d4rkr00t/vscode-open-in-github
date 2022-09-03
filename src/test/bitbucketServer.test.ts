import * as assert from "assert";
import { formatBitbucketServerUrl } from "../bitbucketServer";

suite("#formatBitbucketServerFileUrl", () => {
  test("should format strings for quick pick view", () => {
    const results = formatBitbucketServerUrl(
      "https://bitbucket.org/my-project/my-repo",
      "master",
      "rel/path/to/file.js",
      { start: 10 }
    );
    assert.equal(
      results,
      "https://bitbucket.org/projects/my-project/repos/my-repo/browse/rel/path/to/file.js?at=refs%2Fheads%2Fmaster#10"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = formatBitbucketServerUrl(
      "https://bitbucket.org/my-project/my-repo",
      "master",
      "rel/path/to/file.js",
      { start: 10, end: 20 }
    );
    assert.equal(
      results,
      "https://bitbucket.org/projects/my-project/repos/my-repo/browse/rel/path/to/file.js?at=refs%2Fheads%2Fmaster#10-20"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = formatBitbucketServerUrl(
      "https://bitbucket.org/my-project/my-repo",
      "master",
      "rel/path/to/file.js",
      { start: 10, end: 10 }
    );
    assert.equal(
      results,
      "https://bitbucket.org/projects/my-project/repos/my-repo/browse/rel/path/to/file.js?at=refs%2Fheads%2Fmaster#10"
    );
  });
  test("should format strings for quick pick view", () => {
    const results = formatBitbucketServerUrl(
      "https://bitbucket.org/my-project/my-repo",
      "master",
      "rel/path/to/file.js"
    );
    assert.equal(
      results,
      "https://bitbucket.org/projects/my-project/repos/my-repo/browse/rel/path/to/file.js?at=refs%2Fheads%2Fmaster"
    );
  });
});
