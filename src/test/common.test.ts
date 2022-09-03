import * as assert from "assert";
import * as common from "../common";

suite("#getRemotes", () => {
  const mockRemoteResult = `
origin	git@github.yandex-team.ru:search-interfaces/web4.git (fetch)
origin	git@github.yandex-team.ru:search-interfaces/web4.git
upstream	https://github.yandex-team.ru/serp/web4 (fetch)
upstream	https://github.yandex-team.ru/serp/web4 (push)
`;

  test("should return correct remotes list", (done) => {
    common
      .getRemotes(
        (cmd, opts, cb) => cb(null, mockRemoteResult, null),
        "",
        "",
        "",
        ["master"]
      )
      .then((list) => {
        assert.deepEqual(list, [
          "git@github.yandex-team.ru:search-interfaces/web4.git",
          "https://github.yandex-team.ru/serp/web4",
        ]);
        done();
      })
      .catch(done);
  });

  test("should account for defaultRemote", (done) => {
    common
      .getRemotes(
        (cmd, opts, cb) => cb(null, mockRemoteResult, null),
        "",
        "upstream",
        "",
        ["master"]
      )
      .then((list) => {
        assert.deepEqual(list, [
          "https://github.yandex-team.ru/serp/web4",
          "git@github.yandex-team.ru:search-interfaces/web4.git",
        ]);
        done();
      })
      .catch(done);
  });

  test("should be rejected if error occured", (done) => {
    common
      .getRemotes(
        (cmd, opts, cb) => cb(null, mockRemoteResult, "error"),
        "",
        "",
        "",
        ["master"]
      )
      .then(done)
      .catch(() => done());
  });
});

suite("#formatRemotes", () => {
  const mockRemotesList = [
    "git@github.com:d4rkr00t/language-stylus.git",
    "git@github.yandex-team.ru:search-interfaces/web4.git",
    "https://github.yandex-team.ru/serp/web4",
    "https://github.com/d4rkr00t/language-stylus",
    "https://github.com/Microsoft/TypeScript.git",
    "ssh://user@host.xz/path/to/repo.git/",
    "git://host.xz/path/to/repo.git/",
    "https://host.xz/path/to/repo.git/",
    "ftps://host.xz/path/to/repo.git/",
    "http://host.xz/path/to/repo.git/",
    "ftp://host.xz/path/to/repo.git/",
    "https://user@github.com/some/repo.git",
    "../other",
  ];

  test("should correctly format all types of git remote urls", () => {
    const result = mockRemotesList.map(
      (mock) => common.formatRemotes([mock])[0]
    );
    assert.deepEqual(result, [
      "https://github.com/d4rkr00t/language-stylus",
      "https://github.yandex-team.ru/search-interfaces/web4",
      "https://github.yandex-team.ru/serp/web4",
      "https://github.com/d4rkr00t/language-stylus",
      "https://github.com/Microsoft/TypeScript",
      "https://host.xz/path/to/repo",
      "https://host.xz/path/to/repo.git",
      "https://host.xz/path/to/repo",
      "https://host.xz/path/to/repo.git",
      "http://host.xz/path/to/repo",
      "http://host.xz/path/to/repo.git",
      "https://github.com/some/repo",
      undefined,
    ]);
  });
});

suite("#getBranches", () => {
  const mockBranchResult = `
  dev
* sysoev/SERP-42779
  remotes/origin/sysoev/SERP-42779
  remotes/origin/dev
`;
  const mockBranchResultNoRemotes = `
  dev
* sysoev/SERP-42779
`;

  test("should return current branch", (done) => {
    common
      .getBranches(
        (cmd, opts, cb) => cb(null, mockBranchResult, null),
        "",
        "dev",
        100,
        true
      )
      .then((branch) => {
        assert.deepEqual(branch, ["sysoev/SERP-42779", "dev"]);
        done();
      })
      .catch(done);
  });

  test("should return empty string if there aren`t any remotes with the name of current branch", (done) => {
    common
      .getBranches(
        (cmd, opts, cb) => cb(null, mockBranchResultNoRemotes, null),
        "",
        "dev",
        100,
        true
      )
      .then((branch) => {
        !branch.length && done();
      })
      .catch(done);
  });

  test("should be rejected if error occured", (done) => {
    common
      .getBranches(
        (cmd, opts, cb) => cb(null, mockBranchResult, "error"),
        "",
        "dev"
      )
      .then(done)
      .catch(() => done());
  });
});

suite("#getCurrentRevision", () => {
  const mockRevisionResult = "abc123\n";

  test("should return current revision, with newline stripped", (done) => {
    common
      .getCurrentRevision(
        (cmd, opts, cb) => cb(null, mockRevisionResult, null),
        ""
      )
      .then((branch) => {
        assert.deepEqual(branch, "abc123");
        done();
      })
      .catch(done);
  });

  test("should be rejected if error occurred", (done) => {
    common
      .getCurrentRevision(
        (cmd, opts, cb) => cb(null, mockRevisionResult, "error"),
        ""
      )
      .then(done)
      .catch(() => done());
  });
});

suite("#prepareQuickPickItems", () => {
  const formatters = {
    github: () => "",
    bitbucket: () => "",
    bitbucketServer: () => "",
    gitlab: () => "",
  };
  suite("if current branch and master branch are equal", () => {
    test("should return only 1 item if there is only 1 remote", () => {
      const result = common.prepareQuickPickItems(
        "auto",
        formatters,
        "test-command",
        "file.js",
        { start: 10 },
        [["https://rem"], ["master"]]
      );
      assert.equal(result.length, 1);
    });

    test("should return only 1 item if there is only 1 remote", () => {
      const result = common.prepareQuickPickItems(
        "auto",
        formatters,
        "test-command",
        "file.js",
        { start: 10, end: 20 },
        [["https://rem"], ["master"]]
      );
      assert.equal(result.length, 1);
    });

    test("should return number of quick pick items equal to number of remotes", () => {
      const result = common.prepareQuickPickItems(
        "auto",
        formatters,
        "test-command",
        "file.js",
        { start: 10, end: 20 },
        [["https://rem", "https://rem2"], ["master"]]
      );
      assert.equal(result.length, 2);
    });
  });

  suite("if current branch and master branch are not equal", () => {
    const result = common.prepareQuickPickItems(
      "auto",
      formatters,
      "test-command",
      "file.js",
      { start: 10, end: 20 },
      [
        ["https://rem", "https://rem2"],
        ["feat", "master"],
      ]
    );

    test("should merge quick pick items for current branch and master branch", () => {
      assert.equal(result.length, 4);
    });

    test("should merge quick pick items for current branch and master branch in correct order", () => {
      assert.ok(result[0].detail.includes("feat"));
      assert.ok(result[1].detail.includes("master"));
    });
  });
});
