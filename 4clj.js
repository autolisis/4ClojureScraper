(function() {
  casper = require("casper").create({ logLevel: "debug" });

  fs = require("fs");

  username = casper.cli.args[0];

  password = casper.cli.args[1];

  currentProblem = 1;

  problemCount = 50;

  getProblem = function(number) {
    var url;
    url = "http://www.4clojure.com/problem/" + number;
    return this.start(url, function() {
      var description, solution, test_cases, title;
      title = this.evaluate(function() {
        return jQuery("#prob-title").text();
      });
      description = this.evaluate(function() {
        return jQuery("#prob-desc").text();
      });
      test_cases = this.evaluate(function() {
        return jQuery("table.testcases .CodeMirror.test")
          .map(function() {
            return ";; {0}".format(jQuery(this).text());
          })
          .toArray()
          .join("\n");
      });
      solution = this.evaluate(function() {
        return jQuery("#code-box").val();
      });
      // prettier-ignore
      fs.write(
        "4clojure/{0}-{1}.cljs".format(
          number,
          title.toLowerCase().replace(/\W/g, "_")
        ),
        "#!/usr/bin/env clj\n" +
          ";; " + title + "\n" +
          "(defn func [arg-list]" + "\n" +
          "  )" + "\n" +
          ";;" + description
            .replace(/__/g, "func")
            .split(/\s\s/)
            .join("\n")
            .replace("Special Restrictions", "\n;; Special Restrictions: ") +
          "\n;;\n;; test cases: " + test_cases +
          "\n" + solution,
        "w"
      );
      return this.echo(">>> got problem " + number);
    });
  };

  getAllProblems = function() {
    if (currentProblem <= problemCount) {
      getProblem.call(this, currentProblem);
      currentProblem++;
      return this.run(getAllProblems);
    } else {
      this.echo("downloaded all problems");
      return this.exit();
    }
  };

  casper.start("http://www.4clojure.com/login", function() {
    return this.fill(
      'form[action="/login"]',
      { user: username, pwd: password },
      true
    );
  });

  casper.run(getAllProblems);

  String.prototype.format = function() {
    a = this;
    for (k in arguments) {
      a = a.replace("{" + k + "}", arguments[k]);
    }
    return a;
  };
}.call(this));
